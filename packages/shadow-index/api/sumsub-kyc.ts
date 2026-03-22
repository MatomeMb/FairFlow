/**
 * Sumsub KYC — signed REST calls, Web SDK token, webhook verification, review mapping.
 */
import crypto from 'node:crypto';

const SUMSUB_API_BASE = 'https://api.sumsub.com';

export type SumsubReviewResult = {
  reviewAnswer?: string;
  rejectLabels?: string[];
  reviewRejectType?: string;
};

function signSumsubRequest(secretKey: string, ts: number, method: string, pathWithQuery: string, body: string): string {
  const payload = `${ts}${method.toUpperCase()}${pathWithQuery}${body}`;
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

async function sumsubRequest(
  appToken: string,
  secretKey: string,
  method: string,
  pathWithQuery: string,
  body: string | undefined,
): Promise<{ status: number; text: string }> {
  const ts = Math.floor(Date.now() / 1000);
  const bodyStr = body ?? '';
  const sig = signSumsubRequest(secretKey, ts, method, pathWithQuery, bodyStr);
  const res = await fetch(`${SUMSUB_API_BASE}${pathWithQuery}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Token': appToken,
      'X-App-Access-Ts': String(ts),
      'X-App-Access-Sig': sig,
    },
    body: method === 'GET' || method === 'DELETE' ? undefined : bodyStr,
  });
  const text = await res.text();
  return { status: res.status, text };
}

function sumsubError(method: string, pathWithQuery: string, status: number, body: string): Error {
  return new Error(`[Sumsub] ${method} ${pathWithQuery} failed: ${status} ${body.slice(0, 500)}`);
}

/** GET applicant by externalUserId; returns Sumsub applicant id or null if 404. */
export async function getSumsubApplicantIdByExternalUserId(
  appToken: string,
  secretKey: string,
  externalUserId: string,
): Promise<string | null> {
  const path = `/resources/applicants/-/one?externalUserId=${encodeURIComponent(externalUserId)}`;
  const { status, text } = await sumsubRequest(appToken, secretKey, 'GET', path, undefined);
  if (status === 404) return null;
  if (!status.toString().startsWith('2')) {
    throw sumsubError('GET', path, status, text);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw sumsubError('GET', path, status, text);
  }
  const id = typeof parsed === 'object' && parsed !== null && 'id' in parsed ? String((parsed as { id: unknown }).id) : '';
  return id || null;
}

/** POST /resources/applicants — creates individual applicant bound to externalUserId. */
export async function createSumsubApplicant(
  appToken: string,
  secretKey: string,
  externalUserId: string,
  levelName: string,
): Promise<string> {
  const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;
  const body = JSON.stringify({
    externalUserId,
    fixedInfo: { country: 'ZAF' },
  });
  const { status, text } = await sumsubRequest(appToken, secretKey, 'POST', path, body);
  if (!status.toString().startsWith('2')) {
    throw sumsubError('POST', path, status, text);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw sumsubError('POST', path, status, text);
  }
  const id = typeof parsed === 'object' && parsed !== null && 'id' in parsed ? String((parsed as { id: unknown }).id) : '';
  if (!id) throw sumsubError('POST', path, status, text);
  return id;
}

/** Resolve Sumsub applicant id: existing by externalUserId or create. */
export async function resolveSumsubApplicantId(
  appToken: string,
  secretKey: string,
  externalUserId: string,
  levelName: string,
): Promise<string> {
  const existing = await getSumsubApplicantIdByExternalUserId(appToken, secretKey, externalUserId);
  if (existing) return existing;
  return createSumsubApplicant(appToken, secretKey, externalUserId, levelName);
}

/** Web SDK access token (POST /resources/accessTokens/sdk). */
export async function generateSumsubSdkAccessToken(
  appToken: string,
  secretKey: string,
  externalUserId: string,
  levelName: string,
): Promise<string> {
  const path = '/resources/accessTokens/sdk';
  const body = JSON.stringify({
    userId: externalUserId,
    levelName,
    ttlInSecs: 600,
  });
  const { status, text } = await sumsubRequest(appToken, secretKey, 'POST', path, body);
  if (!status.toString().startsWith('2')) {
    throw sumsubError('POST', path, status, text);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw sumsubError('POST', path, status, text);
  }
  const token =
    typeof parsed === 'object' && parsed !== null && 'token' in parsed
      ? String((parsed as { token: unknown }).token)
      : '';
  if (!token) throw sumsubError('POST', path, status, text);
  return token;
}

/** Verify Sumsub webhook: HMAC-SHA256(raw body) hex in x-payload-digest. */
export function verifySumsubWebhookSignature(payload: string, signatureHeader: string | undefined, webhookSecret: string): boolean {
  if (!signatureHeader || !webhookSecret) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(payload, 'utf8').digest('hex');
  const received = signatureHeader.trim().toLowerCase();
  const expBuf = Buffer.from(expected, 'utf8');
  const recBuf = Buffer.from(received, 'utf8');
  if (expBuf.length !== recBuf.length) return false;
  return crypto.timingSafeEqual(expBuf, recBuf);
}

export function mapSumsubStatus(reviewResult: SumsubReviewResult | undefined | null): 'approved' | 'rejected' | 'pending' {
  const answer = (reviewResult?.reviewAnswer ?? '').toUpperCase();
  if (answer === 'GREEN') return 'approved';
  if (answer === 'RED') return 'rejected';
  return 'pending';
}

export function getSumsubRejectionReason(reviewResult: SumsubReviewResult | undefined | null): string | undefined {
  const label = reviewResult?.rejectLabels?.[0];
  if (!label) return reviewResult?.reviewRejectType ?? 'Verification could not be completed';
  const map: Record<string, string> = {
    FORGERY: 'Document appears to be forged',
    DOCUMENT_TEMPLATE: 'Document template not accepted',
    LOW_QUALITY: 'Document image quality too low',
    SPAM: 'Invalid submission',
    NOT_READABLE: 'Document could not be read',
  };
  return map[label] ?? label;
}

/** Next payout instant: weekly → next Monday 00:00 UTC; monthly → 1st of next month 00:00 UTC. */
export function computeNextPayoutDateIso(frequency: 'weekly' | 'monthly', from = new Date()): string {
  if (frequency === 'monthly') {
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return d.toISOString();
  }
  const d = new Date(from);
  const dow = d.getUTCDay();
  const add = (8 - dow) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function buildKycNotifiedKey(applicantId: string, reviewAnswer: string): string {
  return `${applicantId}:${reviewAnswer}`;
}

export function extractSumsubReviewResult(body: Record<string, unknown>): SumsubReviewResult | undefined {
  const direct = body.reviewResult;
  if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
    return direct as SumsubReviewResult;
  }
  const review = body.review;
  if (review && typeof review === 'object' && !Array.isArray(review)) {
    const rr = (review as Record<string, unknown>).reviewResult;
    if (rr && typeof rr === 'object' && !Array.isArray(rr)) {
      return rr as SumsubReviewResult;
    }
  }
  return undefined;
}
