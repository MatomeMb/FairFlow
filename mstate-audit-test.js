#!/usr/bin/env node

/**
 * M-State Completeness Audit — End-to-End Test
 * Validates the full merchant flow: Register → Login → Create Product → Simulate Orders → KYC → Payouts
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000';
const timestamp = Date.now();
const testEmail = `mstate_audit_${timestamp}@test.com`;
const testPassword = 'SecurePass123!';

let results = {
  testEmail,
  timestamp: new Date().toISOString(),
  steps: {}
};

// Utility: Make HTTP request
const request = (method, pathname, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// Test steps
const tests = {
  async step1_register() {
    console.log('\n=== Step 1: Register Merchant ===');
    try {
      const res = await request('POST', '/v1/auth/merchant/register', {
        business_name: 'Audit Merchant ' + timestamp,
        email: testEmail,
        password: testPassword
      });

      const success = res.status === 200 && res.body?.ok && res.body?.token;
      results.steps.register = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        ok: res.body?.ok,
        token: res.body?.token ? res.body.token.substring(0, 30) + '...' : 'MISSING',
        message: success ? 'Merchant registered successfully' : 'Registration failed'
      };

      if (success) {
        global.token = res.body.token;
      }
      console.log(success ? '✓ Register: PASS' : '✗ Register: FAIL');
      return success;
    } catch (e) {
      results.steps.register = { status: 'FAIL', error: e.message };
      console.log('✗ Register: ERROR -', e.message);
      return false;
    }
  },

  async step2_login() {
    console.log('\n=== Step 2: Login Merchant ===');
    try {
      const res = await request('POST', '/v1/auth/merchant/login', {
        email: testEmail,
        password: testPassword
      });

      const success = res.status === 200 && res.body?.ok && res.body?.token;
      results.steps.login = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        token: res.body?.token ? res.body.token.substring(0, 30) + '...' : 'MISSING',
        message: success ? 'Login successful' : 'Login failed'
      };

      if (success && !global.token) {
        global.token = res.body.token;
      }
      console.log(success ? '✓ Login: PASS' : '✗ Login: FAIL');
      return success;
    } catch (e) {
      results.steps.login = { status: 'FAIL', error: e.message };
      console.log('✗ Login: ERROR -', e.message);
      return false;
    }
  },

  async step3_getMerchant() {
    console.log('\n=== Step 3: GET /v1/auth/merchant/me ===');
    try {
      const res = await request('GET', '/v1/auth/merchant/me', null, {
        'Authorization': `Bearer ${global.token}`
      });

      const success = res.status === 200 && res.body?.id;
      const hasPasswordHash = res.body?.password_hash !== undefined;
      const hasKycData = res.body?.kyc_data !== undefined;

      results.steps.getMe = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        merchantId: res.body?.id,
        businessName: res.body?.business_name,
        email: res.body?.email,
        securityCheck: {
          password_hash_exposed: hasPasswordHash ? 'FAIL' : 'PASS',
          kyc_data_exposed: hasKycData ? 'FAIL' : 'PASS'
        },
        message: success ? 'Account retrieved securely' : 'Account retrieval failed'
      };

      console.log(success ? '✓ Get Account: PASS' : '✗ Get Account: FAIL');
      console.log(hasPasswordHash ? '  ✗ password_hash exposed in response!' : '  ✓ password_hash properly hidden');
      console.log(hasKycData ? '  ✗ kyc_data exposed in response!' : '  ✓ kyc_data properly excluded');
      return success;
    } catch (e) {
      results.steps.getMe = { status: 'FAIL', error: e.message };
      console.log('✗ Get Account: ERROR -', e.message);
      return false;
    }
  },

  async step4_createProduct() {
    console.log('\n=== Step 4: Create Product ===');
    try {
      const res = await request('POST', '/v1/merchant/products', {
        title: 'M-State Audit Coffee ' + timestamp,
        description: 'Test product for audit',
        price_cents: 24900,
        currency: 'ZAR',
        category: 'coffee',
        stock_count: 10,
        shipping_available: true,
        certifications: []
      }, {
        'Authorization': `Bearer ${global.token}`
      });

      const success = res.status === 201 && res.body?.id;
      const hasHash = res.body?.thing_file?.hash;
      const hasMatterUri = res.body?.thing_file?.matter_uri;

      results.steps.createProduct = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        productId: res.body?.id,
        title: res.body?.title,
        hash: hasHash ? res.body.thing_file.hash.substring(0, 20) + '...' : 'MISSING',
        matterUri: hasMatterUri ? 'present' : 'MISSING',
        message: success ? 'Product created with matter:// URI' : 'Product creation failed'
      };

      if (success) {
        global.productHash = res.body.thing_file?.hash;
      }

      console.log(success ? '✓ Create Product: PASS' : '✗ Create Product: FAIL');
      console.log(hasHash ? '  ✓ Hash generated' : '  ✗ Hash MISSING');
      console.log(hasMatterUri ? '  ✓ Matter URI generated' : '  ✗ Matter URI MISSING');
      return success;
    } catch (e) {
      results.steps.createProduct = { status: 'FAIL', error: e.message };
      console.log('✗ Create Product: ERROR -', e.message);
      return false;
    }
  },

  async step5_simulateOrder() {
    console.log('\n=== Step 5: Simulate Stripe Webhook (Order Placed) ===');
    if (!global.productHash) {
      console.log('✗ Skipped: No product hash from previous step');
      return false;
    }

    try {
      const res = await request('POST', '/webhooks/stripe', {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_audit_${timestamp}`,
            amount: 24900,
            currency: 'zar',
            metadata: {
              product_hash: global.productHash,
              customer_email: 'consumer_audit_' + timestamp + '@test.com',
              delivery_name: 'Test Consumer',
              delivery_line1: '1 Test St',
              delivery_suburb: 'Gardens',
              delivery_city: 'Cape Town',
              delivery_postal_code: '8001',
              delivery_phone: '0821234567'
            }
          }
        }
      });

      const success = res.status === 200 && res.body?.ok !== false;
      results.steps.webhook = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        message: success ? 'Order webhook processed' : 'Webhook processing failed'
      };

      console.log(success ? '✓ Webhook: PASS' : '✗ Webhook: FAIL');
      return success;
    } catch (e) {
      results.steps.webhook = { status: 'FAIL', error: e.message };
      console.log('✗ Webhook: ERROR -', e.message);
      return false;
    }
  },

  async step6_verifyOrderData() {
    console.log('\n=== Step 6: Verify Order Data Storage ===');
    try {
      const ordersPath = path.join(__dirname, 'packages/shadow-index/data/orders.json');
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      const orders = Array.isArray(ordersData) ? ordersData : Object.values(ordersData);
      
      const recentOrder = orders
        .filter(o => o.customer_email === 'consumer_audit_' + timestamp + '@test.com')
        .pop();

      const checks = {
        orderExists: !!recentOrder,
        hasProductTitle: !!recentOrder?.product_title,
        hasDeliveryAddress: !!recentOrder?.delivery_address,
        fulfillmentPending: recentOrder?.fulfillment_status === 'pending'
      };

      results.steps.orderData = {
        status: Object.values(checks).every(v => v) ? 'PASS' : 'PARTIAL',
        checks,
        productTitle: recentOrder?.product_title || 'MISSING',
        deliveryAddress: recentOrder?.delivery_address?.name || 'MISSING'
      };

      console.log(checks.orderExists ? '✓ Order exists' : '✗ Order not found');
      console.log(checks.hasProductTitle ? '  ✓ product_title stored: ' + recentOrder?.product_title : '  ✗ product_title MISSING');
      console.log(checks.hasDeliveryAddress ? '  ✓ Delivery address stored' : '  ✗ Address MISSING');
      console.log(checks.fulfillmentPending ? '  ✓ Status is pending' : '  ✗ Status not pending');

      if (recentOrder?.id) {
        global.orderId = recentOrder.id;
      }

      return Object.values(checks).every(v => v);
    } catch (e) {
      results.steps.orderData = { status: 'FAIL', error: e.message };
      console.log('✗ Order Data: ERROR -', e.message);
      return false;
    }
  },

  async step7_fetchOrders() {
    console.log('\n=== Step 7: GET /v1/merchant/orders ===');
    try {
      const res = await request('GET', '/v1/merchant/orders', null, {
        'Authorization': `Bearer ${global.token}`
      });

      const success = res.status === 200 && Array.isArray(res.body?.orders);
      const recentOrder = res.body?.orders?.[0];

      results.steps.getOrders = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        orderCount: res.body?.orders?.length || 0,
        recentOrderCustomer: recentOrder?.customer_email,
        fulfillmentStatus: recentOrder?.fulfillment_status,
        message: success ? 'Orders retrieved' : 'Order fetch failed'
      };

      console.log(success ? '✓ Get Orders: PASS' : '✗ Get Orders: FAIL');
      console.log(success ? `  ✓ Found ${res.body.orders.length} order(s)` : '');
      return success;
    } catch (e) {
      results.steps.getOrders = { status: 'FAIL', error: e.message };
      console.log('✗ Get Orders: ERROR -', e.message);
      return false;
    }
  },

  async step8_fulfillOrder() {
    console.log('\n=== Step 8: Mark Order as Fulfilled ===');
    if (!global.orderId) {
      console.log('✗ Skipped: No order ID from previous steps');
      return false;
    }

    try {
      const res = await request('PATCH', `/v1/merchant/orders/${global.orderId}/fulfill`, {}, {
        'Authorization': `Bearer ${global.token}`
      });

      const success = res.status === 200 && res.body?.order?.fulfillment_status === 'fulfilled';
      results.steps.fulfillOrder = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        statusAfter: res.body?.order?.fulfillment_status,
        message: success ? 'Order marked as fulfilled' : 'Fulfillment failed'
      };

      console.log(success ? '✓ Mark Fulfilled: PASS' : '✗ Mark Fulfilled: FAIL');
      return success;
    } catch (e) {
      results.steps.fulfillOrder = { status: 'FAIL', error: e.message };
      console.log('✗ Mark Fulfilled: ERROR -', e.message);
      return false;
    }
  },

  async step9_submitKyc() {
    console.log('\n=== Step 9: Submit KYC ===');
    try {
      const res = await request('POST', '/v1/merchant/kyc/start', {
        id_number: '8001015009087',
        date_of_birth: '1980-01-01',
        address: '123 Main St, Cape Town',
        phone: '0821234567'
      }, {
        'Authorization': `Bearer ${global.token}`
      });

      const success = res.status === 200;
      const kycStatus = res.body?.account?.kyc_status || res.body?.kyc_status;

      results.steps.submitKyc = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        kycStatus: kycStatus,
        message: success ? 'KYC submitted for review' : 'KYC submission failed'
      };

      // Verify encryption in data file
      try {
        const accountsPath = path.join(__dirname, 'packages/shadow-index/data/merchant_accounts.json');
        const accountsData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
        const account = Array.isArray(accountsData) ? accountsData[0] : Object.values(accountsData)[0];
        
        const kycDataType = typeof account?.kyc_data;
        const idNumberVisible = kycDataType === 'object' && account.kyc_data?.id_number === '8001015009087';
        
        results.steps.submitKyc.encryptionCheck = {
          kyc_data_is_string: kycDataType === 'string' ? 'PASS' : 'FAIL',
          id_number_not_visible: !idNumberVisible ? 'PASS' : 'FAIL'
        };

        console.log(kycDataType === 'string' ? '  ✓ KYC data encrypted as string' : '  ✗ KYC data not encrypted');
        console.log(!idNumberVisible ? '  ✓ ID number not readable in plaintext' : '  ⚠ ID number visible (encryption failed)');
      } catch (e) {
        console.log('  ⚠ Could not verify encryption in file');
      }

      console.log(success ? '✓ Submit KYC: PASS' : '✗ Submit KYC: FAIL');
      return success;
    } catch (e) {
      results.steps.submitKyc = { status: 'FAIL', error: e.message };
      console.log('✗ Submit KYC: ERROR -', e.message);
      return false;
    }
  },

  async step10_getNotifications() {
    console.log('\n=== Step 10: GET /v1/merchant/notifications ===');
    try {
      const res = await request('GET', '/v1/merchant/notifications', null, {
        'Authorization': `Bearer ${global.token}`
      });

      const success = res.status === 200 && Array.isArray(res.body);
      const notifCount = Array.isArray(res.body) ? res.body.length : 0;
      const orderNotif = Array.isArray(res.body) && res.body.find(n => n.type === 'order_received');

      results.steps.getNotifications = {
        status: success ? 'PASS' : 'FAIL',
        statusCode: res.status,
        notificationCount: notifCount,
        hasOrderNotification: !!orderNotif,
        message: success ? 'Notifications retrieved' : 'Notification fetch failed'
      };

      console.log(success ? '✓ Get Notifications: PASS' : '✗ Get Notifications: FAIL');
      console.log(`  ✓ Found ${notifCount} notification(s)`);
      console.log(orderNotif ? '  ✓ Order notification present' : '  ⚠ Order notification not found');
      return success;
    } catch (e) {
      results.steps.getNotifications = { status: 'FAIL', error: e.message };
      console.log('✗ Get Notifications: ERROR -', e.message);
      return false;
    }
  }
};

// Run all tests
(async () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║       M-STATE COMPLETENESS AUDIT — E2E TEST          ║');
  console.log('║         Testing full merchant flow on API             ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log(`\nTest email: ${testEmail}`);
  console.log(`API Base: ${API_BASE}`);

  try {
    await tests.step1_register();
    await tests.step2_login();
    await tests.step3_getMerchant();
    await tests.step4_createProduct();
    await tests.step5_simulateOrder();
    await tests.step6_verifyOrderData();
    await tests.step7_fetchOrders();
    await tests.step8_fulfillOrder();
    await tests.step9_submitKyc();
    await tests.step10_getNotifications();

    const passed = Object.values(results.steps).filter(s => s.status === 'PASS').length;
    const total = Object.keys(results.steps).length;

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log(`║           TEST SUMMARY: ${passed}/${total} PASSED                    ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Save results
    fs.writeFileSync(
      path.join(__dirname, 'mstate-audit-results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('Results saved to mstate-audit-results.json');

  } catch (e) {
    console.error('Test suite error:', e);
    process.exit(1);
  }
})();
