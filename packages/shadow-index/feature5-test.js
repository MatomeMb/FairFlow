(async () => {
  const apiBase = "http://localhost:3000";
  const businessName = "Test Merchant " + Date.now();
  const email = "testmerchant_" + Date.now() + "@test.com";
  const password = "SecurePass123";

  console.log("=== Feature 5: Merchant Self-Serve Registration ===\n");

  // Test 1: Register new merchant
  console.log("1. Testing POST /v1/auth/merchant/register");
  try {
    const res = await fetch(`${apiBase}/v1/auth/merchant/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: businessName,
        email,
        password,
      }),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      console.log("✓ Registration successful");
      console.log("✓ Token returned:", data.token.substring(0, 20) + "...");

      // Test 2: Login with same credentials
      console.log("\n2. Testing POST /v1/auth/merchant/login");
      const loginRes = await fetch(`${apiBase}/v1/auth/merchant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.token) {
        console.log("✓ Login successful");
        console.log("✓ Token returned:", loginData.token.substring(0, 20) + "...");

        // Test 3: Use token to access /v1/auth/merchant/me
        console.log("\n3. Testing GET /v1/auth/merchant/me");
        const meRes = await fetch(`${apiBase}/v1/auth/merchant/me`, {
          headers: {
            Authorization: `Bearer ${loginData.token}`,
          },
        });

        const meData = await meRes.json();
        if (meRes.ok && meData.account) {
          console.log("✓ /me endpoint accessible with JWT");
          console.log("✓ Account returned with business_name:", meData.account.business_name);
          console.log("✓ password_hash hidden:", !meData.account.password_hash ? "✓" : "✗");
          console.log("✓ kyc_data excluded:", !meData.account.kyc_data ? "✓" : "✗");
        } else {
          console.log("✗ /me endpoint failed:", meData.error);
        }
      } else {
        console.log("✗ Login failed:", loginData.error);
      }

      // Test 4: Wrong password
      console.log("\n4. Testing wrong password rejection");
      const wrongRes = await fetch(`${apiBase}/v1/auth/merchant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: "wrongpassword",
        }),
      });

      if (wrongRes.status === 401) {
        console.log("✓ Wrong password correctly rejected with 401");
      } else {
        console.log("✗ Wrong password should return 401, got:", wrongRes.status);
      }

      // Test 5: Password validation
      console.log("\n5. Testing password validation (< 8 chars)");
      const weakRes = await fetch(`${apiBase}/v1/auth/merchant/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: "Another Merchant",
          email: "another_" + Date.now() + "@test.com",
          password: "short",
        }),
      });

      if (weakRes.status === 400) {
        console.log("✓ Weak password correctly rejected with 400");
      } else {
        console.log("✗ Weak password should return 400, got:", weakRes.status);
      }
    } else {
      console.log("✗ Registration failed:", data.error);
    }
  } catch (err) {
    console.error("✗ Test error:", err);
  }

  console.log("\n=== Verification Complete ===");
})();
