import { Hono } from 'hono';
import crypto from 'node:crypto';
import { err } from '../shared/errors.js';
import { logger } from '../../lib/logger.js';
import { ensureOrderFromPaystackChargePayload } from '../services/paystack-order-flow.js';
import { loadPayoutLogs, savePayoutLogs } from '../services/commerce-store.js';

export const webhooksRouter = new Hono();

// POST /webhooks/paystack - Paystack webhook (charge.success, transfer.success, transfer.failed)
webhooksRouter.post('/paystack', async (c) => {
  const signature = c.req.header('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!signature || !secret) {
    return c.json(err('webhook_config_error', 'Missing Paystack signature or secret'), 400);
  }

  const rawBody = await c.req.text();
  const expectedHash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  let sigValid = false;
  if (expectedHash.length === signature.length) {
    try {
      sigValid = crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      // ignore
    }
  }
  if (!sigValid) {
    return c.json(err('webhook_signature_invalid', 'Invalid Paystack signature'), 400);
  }

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody) as { event?: string; data?: Record<string, unknown> };
  } catch {
    return c.json(err('webhook_invalid_json', 'Invalid webhook payload'), 400);
  }

  try {
    if (event.event === 'charge.success') {
      const data = event.data as { reference?: string; metadata?: unknown; customer?: { email?: string } } | undefined;
      if (!data?.reference) {
        logger.warn('Paystack charge.success missing reference', { event });
        return c.json({ ok: true }, 200);
      }
      try {
        await ensureOrderFromPaystackChargePayload({
          reference: data.reference,
          metadata: data.metadata,
          customer: data.customer,
        });
      } catch (error) {
        logger.error('Paystack charge.success order persistence failed', {
          reference: data.reference,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else if (event.event === 'transfer.success' || event.event === 'transfer.failed') {
      const data = event.data as { reference?: string; status?: string } | undefined;
      if (data?.reference) {
        const logs = await loadPayoutLogs();
        const log = logs.find((l) => l.transfer_reference === data.reference);
        if (log) {
          log.status = event.event === 'transfer.success' ? 'completed' : 'failed';
          if (event.event === 'transfer.failed') log.failure_reason = (data as { reason?: string }).reason ?? 'Transfer failed';
          log.transferred_at = event.event === 'transfer.success' ? new Date().toISOString() : null;
          await savePayoutLogs(logs);
        }
      }
    }

    return c.json({ ok: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Paystack webhook processing failed', { error: message });
    return c.json(err('webhook_processing_failed', message), 500);
  }
});
