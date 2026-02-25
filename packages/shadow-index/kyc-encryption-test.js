(async () => {
  const h = { 'Content-Type': 'application/json', 'x-api-key': 'your-dev-api-key-here' };

  // Submit KYC
  console.log('Submitting KYC data with id_number: 8001015009087...');
  const kycRes = await fetch('http://localhost:3000/v1/merchant/kyc/start', {
    method: 'POST', headers: h,
    body: JSON.stringify({
      id_number: '8001015009087',
      date_of_birth: '1980-01-01',
      address: '123 Main St',
      phone: '0821234567'
    })
  });
  
  const kycJson = await kycRes.json();
  console.log('KYC submission response ok:', kycJson.ok);

  // Wait a moment for file write
  await new Promise(r => setTimeout(r, 100));

  // Check raw file
  const fs = await import('fs/promises');
  const raw = await fs.readFile('./data/merchant_accounts.json', 'utf8');
  const acc = JSON.parse(raw);
  
  const isEncrypted = typeof acc.kyc_data === 'string';
  console.log('KYC data encrypted at rest:', isEncrypted ? '✓' : '✗ PLAINTEXT');
  
  const containsIdNumber = JSON.stringify(acc).includes('8001015009087');
  console.log('Contains id_number:', containsIdNumber ? '✗ EXPOSED' : '✓ hidden');
  
  // Check API response
  const apiRes = await fetch('http://localhost:3000/v1/merchant/account', { 
    headers: h 
  });
  const apiData = await apiRes.json();
  
  const hasKycData = !!apiData.kyc_data;
  console.log('API hides kyc_data:', !hasKycData ? '✓' : '✗ EXPOSED');
  console.log('API has business_name:', !!apiData.business_name ? '✓' : '✗');
})();
