import { loadMerchantAccounts } from '../repos/merchant-accounts.js';
import { verifyJwt } from '../shared/jwt.js';
import type { MerchantAccount } from '../shared/merchant-types.js';
import { getJwtSecret } from '../shared/runtime-config.js';
import { extractBearerToken } from './portal-oauth.js';

export async function getMerchantIdentity(c: {
  req: { header: (name: string) => string | undefined };
}): Promise<{
  account: MerchantAccount | null;
  merchantIds: string[];
}> {
  const token = extractBearerToken(c.req.header('Authorization'));
  if (!token) {
    return { account: null, merchantIds: [] };
  }

  const payload = verifyJwt(token, getJwtSecret());
  if (!payload || payload.typ !== 'merchant_auth') {
    return { account: null, merchantIds: [] };
  }

  const subject = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : null;
  const accounts = await loadMerchantAccounts();
  const account =
    accounts.find(
      (candidate) =>
        (subject && candidate.id === subject) || (email && candidate.email.toLowerCase() === email)
    ) ?? null;

  const merchantIds: string[] = [];
  if (account?.id) merchantIds.push(account.id);
  return { account, merchantIds };
}
