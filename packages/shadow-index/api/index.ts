/**
 * Shadow Index API
 * 
 * Fast hash-to-artifact resolution service
 * Deployed on Vercel Edge Functions
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'shadow-index', timestamp: new Date().toISOString() });
});

// Compile endpoint - transforms product data into .thing file
app.post('/compile', async (c) => {
  // TODO: Implement compilation endpoint
  return c.json({ error: 'Not implemented yet' }, 501);
});

// Resolve hash to artifact URL
app.get('/resolve/:hash', async (c) => {
  const hash = c.req.param('hash');
  // TODO: Implement hash resolution
  return c.json({ error: 'Not implemented yet', hash }, 501);
});

// Get gist (minimal product data) by hash
app.get('/gist/:hash', async (c) => {
  const hash = c.req.param('hash');
  // TODO: Implement gist retrieval
  return c.json({ error: 'Not implemented yet', hash }, 501);
});

// Batch compilation endpoint
app.post('/batch', async (c) => {
  // TODO: Implement batch compilation
  return c.json({ error: 'Not implemented yet' }, 501);
});

// Development server - always start in dev mode
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Shadow Index API starting on http://localhost:${port}`);
console.log(`📡 Health check: http://localhost:${port}/health`);
serve({
  fetch: app.fetch,
  port,
});

// Export for Vercel Edge Functions
export default app;
