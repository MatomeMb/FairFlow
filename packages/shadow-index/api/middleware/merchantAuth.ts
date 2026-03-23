import { verifyJwt } from '../shared/jwt.js';
import { getJwtSecret } from '../shared/runtime-config.js';

/**
 * True when Authorization bearer is a valid merchant_auth JWT.
 * Used by API-key middleware to allow merchant sessions without x-api-key.
 */
export function isValidMerchantAuthBearer(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const bearer = authHeader.slice(7);
  const payload = verifyJwt(bearer, getJwtSecret());
  return payload?.typ === 'merchant_auth';
}
