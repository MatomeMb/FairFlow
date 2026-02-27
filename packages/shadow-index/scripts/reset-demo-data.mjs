#!/usr/bin/env node
/**
 * Reset demo data for Monday 13:30 call.
 * - Notifications: set all read: false
 * - Log product stock (flag restock if < 5)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = join(__dirname, '..', 'data');

const notifs = JSON.parse(readFileSync(join(base, 'notifications.json'), 'utf8'));
const narr = Array.isArray(notifs) ? notifs : Object.values(notifs);
const reset = narr.map(n => ({ ...n, read: false }));
writeFileSync(join(base, 'notifications.json'), JSON.stringify(reset, null, 2));
console.log('Notifications reset to unread:', reset.length);

const prods = JSON.parse(readFileSync(join(base, 'merchant-products.json'), 'utf8'));
const parr = Array.isArray(prods) ? prods : Object.values(prods);
parr.forEach(p =>
  console.log(`  ${p.title} | stock: ${p.stock_count} ${p.stock_count < 5 ? '[WARN] restock needed' : '[OK]'}`)
);
