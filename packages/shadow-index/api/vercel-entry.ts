/**
 * Vercel serverless entry point.
 * Wraps the Hono app with the Node server adapter so all routes
 * are handled by a single Node.js Lambda function.
 */
import { handle } from '@hono/node-server/vercel';
import app from './index.js';

export const config = {
  maxDuration: 30,
};

export default handle(app);
