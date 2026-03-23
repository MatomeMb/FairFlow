import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

const prodOrigins = [
  'https://fairflow.co.za',
  'https://www.fairflow.co.za',
  'https://portal.fairflow.co.za',
  'https://api.fairflow.co.za',
];
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5178',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5178',
];
const allowedOrigins =
  process.env.NODE_ENV === 'production' ? prodOrigins : [...prodOrigins, ...devOrigins];

export const corsMiddleware: MiddlewareHandler = cors({
  origin: allowedOrigins,
  allowHeaders: ['Content-Type', 'Authorization', 'x-merchant-id', 'x-api-key', 'x-auth-portal-base-url'],
  allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
});
