type AdminErrorStatus = 400 | 401 | 403 | 404 | 500;

export class AdminHttpError extends Error {
  override readonly name = 'AdminHttpError';

  constructor(
    public readonly status: AdminErrorStatus,
    public readonly body: unknown,
  ) {
    super('AdminHttpError');
  }
}
