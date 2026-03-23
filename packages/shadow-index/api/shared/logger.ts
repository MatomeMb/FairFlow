import pino, { type Logger } from 'pino';
import type { Context } from 'hono';

export const apiLogger: Logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'shadow-index',
    runtime: 'hono',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const withRequestContext = (c: Context): Logger => {
  const requestId = c.get('requestId');
  const correlationId = c.get('correlationId');
  const merchantId = c.get('merchantId');
  return apiLogger.child({
    requestId,
    correlationId,
    merchantId: merchantId ?? null,
    path: c.req.path,
    method: c.req.method,
  });
};

export const emitMetric = (
  logger: Logger,
  metric: string,
  value: number,
  tags?: Record<string, string | number | boolean | null>
): void => {
  logger.info({
    type: 'metric',
    metric,
    value,
    tags: tags ?? {},
  });
};

