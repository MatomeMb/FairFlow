/**
 * Vercel serverless entry point.
 * Uses Hono's native Vercel adapter (Web Request API) so all routes
 * are handled by a single serverless function.
 */
import { handle } from 'hono/vercel';
import app from './index.js';

export const config = {
  maxDuration: 30,
};

export default handle(app);
