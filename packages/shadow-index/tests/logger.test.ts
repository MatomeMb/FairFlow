import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../lib/logger.js';

describe('structured logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('logger.info emits valid JSON to console.info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test message', { key: 'value' });

    expect(spy).toHaveBeenCalledOnce();
    const line = spy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);
    expect(parsed.level).toBe('info');
    expect(parsed.msg).toBe('test message');
    expect(parsed.key).toBe('value');
    expect(parsed.service).toBe('shadow-index');
    expect(parsed.ts).toBeDefined();
  });

  it('logger.error emits to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('fatal', { code: 500 });

    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('error');
    expect(parsed.code).toBe(500);
  });

  it('logger.warn emits to console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('deprecation notice');

    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('warn');
  });
});
