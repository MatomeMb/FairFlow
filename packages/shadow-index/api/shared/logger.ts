import type { Context } from 'hono';

type LogBindings = Record<string, unknown>;

export interface AppLogger {
  info(payload?: unknown, msg?: unknown): void;
  warn(payload?: unknown, msg?: unknown): void;
  error(payload?: unknown, msg?: unknown): void;
  child(bindings: LogBindings): AppLogger;
}

const BASE_LOG: LogBindings = {
  service: 'shadow-index',
  runtime: 'hono',
};

const parseArgs = (payload?: unknown, msg?: unknown): { fields: LogBindings; text?: string } => {
  if (typeof payload === 'string') {
    if (msg && typeof msg === 'object') {
      return { fields: msg as LogBindings, text: payload };
    }
    return { fields: {}, text: payload };
  }
  if (payload && typeof payload === 'object') {
    if (typeof msg === 'string') {
      return { fields: payload as LogBindings, text: msg };
    }
    return { fields: payload as LogBindings };
  }
  if (typeof msg === 'string') {
    return { fields: {}, text: msg };
  }
  return { fields: {} };
};

const createLogger = (bindings: LogBindings = {}): AppLogger => {
  const write = (level: 'info' | 'warn' | 'error', payload?: unknown, msg?: unknown) => {
    const { fields, text } = parseArgs(payload, msg);
    const logEntry: LogBindings = {
      level,
      time: new Date().toISOString(),
      ...BASE_LOG,
      ...bindings,
      ...fields,
    };
    if (text) {
      logEntry.msg = text;
    }
    const line = JSON.stringify(logEntry);
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.info(line);
    }
  };

  return {
    info: (payload?: unknown, msg?: unknown) => write('info', payload, msg),
    warn: (payload?: unknown, msg?: unknown) => write('warn', payload, msg),
    error: (payload?: unknown, msg?: unknown) => write('error', payload, msg),
    child: (childBindings: LogBindings) => createLogger({ ...bindings, ...childBindings }),
  };
};

export const apiLogger: AppLogger = createLogger();

export const withRequestContext = (c: Context): AppLogger => {
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
  logger: AppLogger,
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

