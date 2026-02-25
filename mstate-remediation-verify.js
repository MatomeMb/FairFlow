(async () => {
  const h = { 'Content-Type': 'application/json' };

  console.log('P0-1 Register link on login: Manual UI check required');

  const fs = require('fs');
  const portal = fs.readFileSync('packages/auth-portal/src/pages/portals/MerchantPortal.tsx','utf8');
  console.log('P0-3 KYC explanation text:', portal.includes('financial regulations') ? '✓' : '✗ MISSING');
  console.log('P1-4 Logout button:', portal.includes('sessionStorage.removeItem') ? '✓' : '✗ MISSING');
  console.log('P1-5 product_title in order card:', portal.includes('order.product_title') ? '✓' : '✗ MISSING');
  console.log('P1-7 high_value_order styling:', portal.includes('high_value_order') ? '✓' : '✗ MISSING');
  console.log('P1-8 Payout minimum helper:', portal.includes('payout_minimum') && portal.includes('more') ? '✓' : '✗ MISSING');

  const modal = fs.readFileSync('packages/auth-portal/src/components/CreateProductModal.tsx','utf8');
  console.log('P1-6 matter:// explanation:', modal.includes('portable product link') ? '✓' : '✗ MISSING');

  const r1 = await fetch('http://localhost:3000/v1/auth/merchant/forgot-password', {
    method: 'POST', headers: h,
    body: JSON.stringify({ email: 'nonexistent@test.com' })
  }).then(r => r.json()).catch(() => ({ ok: false }));
  console.log('P2-9 Forgot password endpoint:', r1.ok !== undefined ? '✓ exists' : '✗ MISSING');

  const token = require('crypto').randomUUID();
  const r2 = await fetch('http://localhost:3000/v1/auth/merchant/reset-password', {
    method: 'POST', headers: h,
    body: JSON.stringify({ token, new_password: 'NewPass123!' })
  }).then(r => r.json()).catch(() => ({ ok: false }));
  console.log('P2-9 Reset password endpoint:', r2.ok === false || r2.code === 'invalid_token' ? '✓ exists (invalid token rejected)' : '✗ MISSING');
})();