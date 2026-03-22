let _paystack: ReturnType<typeof Object> | null = null;

export async function getPaystack() {
  if (!_paystack) {
    const { default: Paystack } = await import('@paystack/paystack-sdk');
    _paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '');
  }
  return _paystack;
}
