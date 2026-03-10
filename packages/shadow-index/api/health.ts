type JsonResponse = {
  status: (code: number) => {
    json: (payload: unknown) => void;
  };
};

export default function handler(_req: unknown, res: JsonResponse): void {
  res.status(200).json({
    status: 'ok',
    service: 'shadow-index',
    timestamp: new Date().toISOString(),
    source: 'vercel-function-fallback',
  });
}
