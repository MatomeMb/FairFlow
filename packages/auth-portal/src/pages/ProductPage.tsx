import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ShoppingCart } from 'lucide-react';
import { FairflowLogo } from '../components/FairflowLogo';
import { apiBase } from '../lib/config';
import { formatPrice } from '../lib/format';
import { AddressFields, type AddressForm } from '../components/shared/AddressFields';

interface ThingFile {
  product: {
    id: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    image_url?: string;
    category?: string;
  };
  commerce: {
    merchant_id: string;
    payment_gateway: 'paystack';
    supported_currencies: string[];
    shipping_available: boolean;
  };
  metadata: {
    schema_version: '1.0';
    created_at: string;
    matter_uri: string;
    thing_url: string;
    stock_count?: number;
  };
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getAnonId = (): string => {
  const key = 'ttm_anon_id';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  return id;
};

const sendAnalyticsEvent = async (payload: Record<string, unknown>) => {
  try {
    await fetch(`${apiBase}/v1/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Ignore analytics errors
  }
};

export function ProductPage() {
  const { hash } = useParams<{ hash: string }>();
  const [thing, setThing] = useState<ThingFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<AddressForm>({
    name: '',
    line1: '',
    line2: '',
    suburb: '',
    city: '',
    postal_code: '',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState<AddressForm>({
    name: '',
    line1: '',
    line2: '',
    suburb: '',
    city: '',
    postal_code: '',
    phone: '',
  });
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [emailError, setEmailError] = useState<string>('');

  useEffect(() => {
    if (!hash) {
      setError('Invalid product link');
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/thing/${hash}.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Product not found');
        }
        return res.json();
      })
      .then((data) => {
        setThing(data);
        setLoading(false);
        if (hash) {
          sendAnalyticsEvent({
            event: 'view',
            hash,
            source_url: window.location.href,
            anon_id: getAnonId(),
          });
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load product');
        setLoading(false);
      });
  }, [hash]);

  useEffect(() => {
    const title = thing?.product.title ? `${thing.product.title} — fairflow` : 'fairflow';
    document.title = title;
  }, [thing]);

  const validateAddress = (address: AddressForm, setErrors: (errors: Record<string, string>) => void) => {
    const errors: Record<string, string> = {};
    if (!address.name.trim()) errors.name = 'Recipient name is required';
    if (!address.line1.trim()) errors.line1 = 'Street address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.postal_code.trim()) errors.postal_code = 'Postal code is required';
    if (!address.phone.trim()) errors.phone = 'Phone number is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBuyNow = async () => {
    setEmailError('');

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!showAddressForm) {
      setShowAddressForm(true);
      return;
    }

    if (!validateAddress(deliveryAddress, setAddressErrors)) {
      return;
    }

    if (!billingSameAsDelivery && !validateAddress(billingAddress, setBillingErrors)) {
      return;
    }

    if (!hash) return;

    sendAnalyticsEvent({
      event: 'click',
      hash,
      source_url: window.location.href,
      target_action: 'checkout_initiated',
      anon_id: getAnonId(),
    });

    setCheckoutLoading(true);

    try {
      const response = await fetch(`${apiBase}/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_hash: hash,
          customer_email: email,
          delivery_address: deliveryAddress,
          billing_address: billingSameAsDelivery ? deliveryAddress : billingAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      const url = data.authorization_url || data.url;
      if (url) window.location.href = url;
    } catch {
      setError('Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--ff-info)] mx-auto mb-4" />
          <p className="text-[#8A99AA]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !thing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-[var(--ff-error-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--ff-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-[#8A99AA]">
            {error || 'This product is no longer available or the link may be invalid.'}
          </p>
        </div>
      </div>
    );
  }

  const emailValid = isValidEmail(email);
  const isOutOfStock = (thing?.metadata?.stock_count ?? 1) <= 0;

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Header */}
      <div className="bg-[#1A2D42] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <FairflowLogo markHeight={32} />
            <span className="text-xs text-[#8A99AA] font-mono">matter://{hash?.slice(0, 12)}...</span>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-[#1A2D42] rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-12">
            {/* Product Image */}
            <div className="aspect-square bg-[var(--ff-surface)] rounded-xl overflow-hidden flex items-center justify-center">
              {thing.product.image_url && !imageError ? (
                <img
                  src={thing.product.image_url}
                  alt={thing.product.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-[var(--ff-border)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-[#8A99AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#8A99AA]">Product Image</p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              {/* Title & Price */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-3">
                  {thing.product.title}
                </h2>
                <div className="text-4xl font-bold text-[var(--ff-info)]">
                  {formatPrice(thing.product.price, thing.product.currency)}
                </div>
              </div>

              {/* Description */}
              {thing.product.description && (
                <div className="mb-8">
                  <p className="text-[#8A99AA] leading-relaxed">
                    {thing.product.description}
                  </p>
                </div>
              )}

              {showAddressForm && (
                <div className="flex items-center gap-2 mb-4 text-sm text-[#8A99AA]">
                  <span className="flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-[var(--ff-info-subtle)] text-[var(--ff-info)] text-xs flex items-center justify-center font-semibold">✓</span>
                    Contact
                  </span>
                  <span className="flex-1 h-px bg-[var(--ff-border)]" />
                  <span className="flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-[var(--ff-info)] text-white text-xs flex items-center justify-center font-semibold">2</span>
                    Delivery
                  </span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBuyNow();
                }}
              >
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-[rgba(255,255,255,0.10)] rounded-lg focus:ring-2 focus:ring-[var(--ff-focus)] focus:border-transparent text-white placeholder-[#8A99AA]"
                    disabled={checkoutLoading}
                  />
                  {emailError && <p className="text-[var(--ff-error)] text-xs mt-1">{emailError}</p>}
                </div>

                {showAddressForm && (
                  <div className="mt-4 space-y-3 border border-[rgba(255,255,255,0.10)] rounded-lg p-4 bg-[#0D1B2A] mb-6">
                    <h3 className="text-sm font-semibold text-white">Delivery Address</h3>

                    <AddressFields
                      values={deliveryAddress}
                      onChange={setDeliveryAddress}
                      errors={addressErrors}
                      prefix="delivery"
                    />

                    <div className="pt-3 border-t border-[rgba(255,255,255,0.10)] mt-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Billing Address</h3>
                        <label className="text-xs text-[#8A99AA] flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={billingSameAsDelivery}
                            onChange={(e) => {
                              setBillingSameAsDelivery(e.target.checked);
                              setBillingErrors({});
                            }}
                          />
                          Same as delivery
                        </label>
                      </div>

                      {!billingSameAsDelivery && (
                        <div className="mt-3 space-y-3">
                          <AddressFields
                            values={billingAddress}
                            onChange={setBillingAddress}
                            errors={billingErrors}
                            prefix="billing"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!emailValid || checkoutLoading || isOutOfStock}
                  className="w-full bg-[var(--ff-info)] text-white font-semibold py-4 px-6 rounded-lg hover:bg-[var(--ff-info-bold)] active:brightness-90 disabled:bg-[var(--ff-neutral-muted)] disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 text-lg"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : isOutOfStock ? (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Out of Stock
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {showAddressForm ? 'Continue to Payment' : 'Buy Now'}
                    </>
                  )}
                </button>
              </form>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.07)]">
                <div className="flex items-center gap-4 text-sm text-[#8A99AA]">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--ff-success)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure checkout
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--ff-info)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email receipt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Powered By */}
        <div className="text-center mt-8">
          <p className="text-sm text-stone-500">
            Powered by <span className="font-semibold">fairflow</span> — Distributed Commerce
          </p>
        </div>
      </div>
    </div>
  );
}
