export interface MerchantProductApi {
  id: string;
  title: string;
  description?: string;
  price_cents: number;
  currency: 'ZAR';
  category?: string;
  stock_count: number;
  image_url?: string;
  shipping_available: boolean;
  certifications: string[];
  thing_file?: {
    hash: string;
    matter_uri: string;
    thing_url: string;
    generated_at: string;
  };
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DeliveryAddress {
  name?: string;
  line1?: string;
  line2?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
}

export interface MerchantOrder {
  id: string;
  /** Payment lifecycle from checkout (e.g. paid, pending, failed). */
  status?: string;
  session_id?: string;
  paystack_reference?: string;
  product_hash?: string;
  product_id?: string;
  product_title?: string;
  customer_email: string;
  amount?: number;
  merchant_price_cents?: number;
  consumer_price_cents?: number;
  currency: string;
  created_at: string;
  merchant_marked_fulfilled_at?: string;
  consumer_confirmed_delivery?: boolean;
  consumer_confirmed_at?: string;
  customer_confirmed_at?: string;
  payout_status?: 'holding' | 'pending_release' | 'released' | 'failed';
  payment_status?: 'held' | 'shipped' | 'confirmed' | 'released' | 'disputed';
  payout_log_id?: string;
  fulfilled_at?: string | null;
  shipped_at?: string | null;
  shipment_slip_url?: string | null;
  fulfillment_status?: 'pending' | 'shipped' | 'fulfilled' | 'delivered';
  delivery_address?: DeliveryAddress | null;
  estimated_delivery_date?: string | null;
}

export interface MerchantNotification {
  id: string;
  merchant_id: string;
  type: 'order_received' | 'low_stock' | 'payout_processed' | 'kyc_approved' | 'kyc_rejected' | 'high_value_order';
  title: string;
  message: string;
  data: {
    order_id?: string;
    product_id?: string;
    product_title?: string;
    order_total?: number;
    customer_email?: string;
    delivery_address?: string;
    kyc_verified_at?: string;
    rejection_reason?: string;
    next_payout_date?: string;
  };
  read: boolean;
  created_at: string;
}

export interface MerchantAccount {
  id: string;
  business_name: string;
  email: string;
  kyc_status: 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
  kyc_data?: {
    id_number: string;
    date_of_birth: string;
    address: string;
    phone: string;
  };
  kyc_verified_at?: string;
  kyc_rejection_reason?: string;
  payout_eligible?: boolean;
  next_payout_date?: string;
  smile_id_job_id?: string;
  smile_id_session_id?: string;
  smile_id_result_code?: string;
  smile_id_result_text?: string;
  bank_account?: {
    account_holder_name: string;
    account_number: string;
    branch_code: string;
    bank_name: string;
    account_type: 'cheque' | 'savings' | 'transmission';
  };
  commission_rate: number;
  payout_frequency: 'weekly' | 'monthly';
  payout_minimum: number;
  total_earnings: number;
  pending_payout: number;
  updated_at: string;
}

export interface PayoutLog {
  id: string;
  merchant_id: string;
  orders_included: string[];
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}
