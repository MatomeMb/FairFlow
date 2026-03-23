/** Consistent error response shape for MVP flows (MVP-10) */
export type ErrorPayload = { code: string; message: string; details?: unknown };

export const err = (code: string, message: string, details?: unknown): ErrorPayload =>
  details !== undefined ? { code, message, details } : { code, message };
