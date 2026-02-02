# Create a simple test .thing file for Phase 0 testing
# This is a dummy binary file that simulates a .thing file

$testThingContent = @"
MATTER_THING_V1
This is a test .thing file for Phase 0 platform validation testing.
It contains dummy data to test steganography survival across platforms.
Product: Test Product
Price: 2999
Currency: USD
Hash: test_hash_12345
"@

$testThingContent | Out-File -FilePath "test_thing.bin" -Encoding utf8 -NoNewline

Write-Output "Created test_thing.bin ($($testThingContent.Length) bytes)"
