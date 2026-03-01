/**
 * Structured Logger
 *
 * Lightweight JSON logger for production use. Replaces raw console.*
 * calls with structured output suitable for log aggregation (Datadog,
 * Logflare, Axiom, etc.).
 *
 * Log levels: debug < info < warn < error
 * Set LOG_LEVEL env var to control verbosity (default: "info").
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (): number => {
  const envLevel = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
  return LEVELS[envLevel] ?? LEVELS.info;
};

interface LogEntry {
  level: LogLevel;
  ts: string;
  service: string;
  msg: string;
  [key: string]: unknown;
}

const SERVICE = 'shadow-index';

function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
  if (LEVELS[level] < currentLevel()) return;

  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    service: SERVICE,
    msg,
    ...meta,
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    default:
      console.info(line);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
};
