/**
 * Platform Configuration
 * 
 * Single source of truth for platform-wide constants.
 * Centralizes commission rates, payout thresholds, and business rules.
 */

export const PLATFORM_CONFIG = {
  /**
   * Platform commission rate (3%)
   * Deducted from merchant earnings at payout time.
   * Consumer pays merchant's listed price with no markup.
   */
  commission_rate: 0.03,

  /**
   * Payout currency (South African Rand)
   */
  payout_currency: 'ZAR' as const,

  /**
   * Minimum payout threshold in cents (R500.00)
   * Merchants must accumulate at least this amount before payout release.
   */
  payout_minimum_cents: 50000,

  /**
   * Default payout frequency
   */
  payout_frequency: 'weekly' as const,

  /**
   * Delivery confirmation token expiry (30 days in milliseconds)
   */
  delivery_confirmation_expiry_ms: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * South African bank account interface
 * Only SA domestic bank accounts are accepted for payouts.
 */
export interface SABankAccount {
  /** Full name as it appears on the bank account */
  account_holder_name: string;

  /** Bank name - must be one of the supported SA banks */
  bank_name: string;

  /** Account number - 9-11 digits numeric string */
  account_number: string;

  /** Branch code - 6-digit numeric string */
  branch_code: string;

  /** Account type */
  account_type: 'cheque' | 'savings' | 'transmission';
}

/**
 * Supported South African banks for payout accounts
 */
export const SA_BANKS = [
  'ABSA',
  'FNB',
  'Standard Bank',
  'Nedbank',
  'Capitec',
  'African Bank',
  'Discovery Bank',
  'TymeBank',
  'Other',
] as const;

export type SABank = typeof SA_BANKS[number];
