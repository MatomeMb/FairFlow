/**
 * Vercel serverless entry point.
 * Wraps the Hono app with the hono/vercel handle adapter so all routes
 * are handled by a single Node.js Lambda function.
 */
import { handle } from 'hono/vercel';
import app from './index.js';

export const config = {
  runtime: 'nodejs20.x',
  memory: 1024,
  maxDuration: 30,
};

export default handle(app);
