/**
 * Vercel serverless entry point.
 * Wraps the Hono app with the Node server adapter.
 *
 * Workaround: @hono/node-server tries to read the request body via
 * Readable.toWeb(incoming) which can hang on Vercel's serverless runtime
 * when the body stream is already consumed/buffered. We pre-read the body
 * into `rawBody` on the IncomingMessage so the adapter uses the Buffer
 * path instead of the stream path.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handle } from '@hono/node-server/vercel';
import app from './index.js';

export const config = {
  maxDuration: 30,
};

const honoHandler = handle(app);

function collectBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // If Vercel already set rawBody, use it
    if ('rawBody' in req && Buffer.isBuffer((req as any).rawBody)) {
      resolve((req as any).rawBody);
      return;
    }
    // If body is already available as a Buffer/string (Vercel v3+)
    if ('body' in req && req.body != null) {
      const b = req.body;
      if (Buffer.isBuffer(b)) { resolve(b); return; }
      if (typeof b === 'string') { resolve(Buffer.from(b)); return; }
      if (typeof b === 'object') { resolve(Buffer.from(JSON.stringify(b))); return; }
    }
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD' && !('rawBody' in req)) {
    (req as any).rawBody = await collectBody(req);
  }
  return honoHandler(req, res);
}
