(async () => {
  const HASH = '047fbfb2018b6791aef91b07da5b3b7e28d8e0ef003132d1e2fad59a91a8947e';
  const h = { 'Content-Type': 'application/json' };

  // Control 1: Rate limit — fire 6 checkouts from same email
  const email = 'fraudtest_' + Date.now() + '@test.com';
  let blocked = 0;
  let allowed = 0;
  for (let i = 0; i < 6; i++) {
    const res = await fetch('http://localhost:3000/checkout/create-session', {
      method: 'POST', headers: h,
      body: JSON.stringify({ product_hash: HASH, customer_email: email })
    });
    if (res.status === 429) blocked++;
    else allowed++;
  }
  console.log('Control 1 rate limit: allowed=' + allowed + ' blocked=' + blocked);
  console.log(allowed === 5 && blocked === 1 ? '✓ Rate limit working (5 allowed, 1 blocked)' : '✗ Rate limit mismatch');

  // Control 2: High-value order flag
  const piId = 'pi_highvalue_' + Date.now();
  await fetch('http://localhost:3000/webhooks/stripe', {
    method: 'POST', headers: h,
    body: JSON.stringify({
      type: 'payment_intent.succeeded',
      data: { object: {
        id: piId, amount: 75000, currency: 'zar',
        metadata: { product_hash: HASH, customer_email: 'highvalue@test.com' }
      }}
    })
  });
  await new Promise(r => setTimeout(r, 500));

  const fs = await import('fs/promises');
  const orders = JSON.parse(await fs.readFile('./data/orders.json', 'utf8'));
  const hvOrder = Object.values(orders).find(o => o.customer_email === 'highvalue@test.com');
  console.log('Control 2 high-value flag:', hvOrder?.requires_review === true ? '✓ requires_review set' : '✗ flag missing');

  const notifs = JSON.parse(await fs.readFile('./data/notifications.json', 'utf8'));
  const hvNotif = (Array.isArray(notifs) ? notifs : Object.values(notifs))
    .find(n => n.type === 'high_value_order' && n.data?.order_id === hvOrder?.id);
  console.log('Control 2 notification:', hvNotif ? '✓ high_value_order notification created' : '✗ notification missing');

  // Control 3: IP logging — check server log manually
  console.log('Control 3 IP logging: check server console for [webhook] Incoming from IP: line');
})();
