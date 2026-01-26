#!/usr/bin/env python3
"""
Generate Ed25519 key pair for cryptographic signing
Outputs keys in base64 format ready for .env file
"""

try:
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.hazmat.primitives import serialization
    import base64
    import sys
except ImportError:
    print("ERROR: cryptography library not installed.")
    print("Installing cryptography library...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cryptography"])
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.hazmat.primitives import serialization
    import base64

# Generate Ed25519 key pair
print("Generating Ed25519 key pair...")
private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

# Serialize private key
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

# Serialize public key
public_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

# Convert to base64
private_b64 = base64.b64encode(private_pem).decode('utf-8')
public_b64 = base64.b64encode(public_pem).decode('utf-8')

print("\n" + "="*60)
print("Ed25519 Keys Generated Successfully!")
print("="*60)
print("\nAdd these to your .env file:\n")
print(f"SIGNING_PRIVATE_KEY={private_b64}")
print(f"SIGNING_PUBLIC_KEY={public_b64}")
print("\n" + "="*60)
print("\n⚠️  IMPORTANT: Keep the private key secret!")
print("✅ The public key can be shared (used for verification)")
print("\nKeys have been generated and are ready to use.")
print("="*60)

# Save to a temporary file for easy copying
with open("ed25519_keys.txt", "w") as f:
    f.write(f"SIGNING_PRIVATE_KEY={private_b64}\n")
    f.write(f"SIGNING_PUBLIC_KEY={public_b64}\n")

print("\nKeys also saved to: ed25519_keys.txt")
print("You can copy from there or use the output above.")
