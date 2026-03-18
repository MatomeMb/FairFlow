import { MetricCard } from '../../../components/shared/MetricCard';
import { RoleBadge } from '../../../components/shared/RoleBadge';
import { Star } from 'lucide-react';
import type { CEOOnboardForm } from '../hooks/useCEOOnboarding';

interface Merchant {
  id: string;
  businessName: string;
  email: string;
  role: 'merchant';
  ethicalScore: number;
  status: 'Active' | 'Pending' | 'Inactive';
  products: number;
  memberSince: string;
}

interface CEOMerchantsSectionProps {
  merchants: Merchant[];
  showOnboardModal: boolean;
  onboardForm: CEOOnboardForm;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onSubmit: () => void;
  onUpdateField: (field: keyof CEOOnboardForm, value: string) => void;
  onToggleCertification: (certification: string, checked: boolean) => void;
}

export function CEOMerchantsSection({
  merchants,
  showOnboardModal,
  onboardForm,
  onOpenModal,
  onCloseModal,
  onSubmit,
  onUpdateField,
  onToggleCertification,
}: CEOMerchantsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ff-ink)]">Merchants ({merchants.length} active)</h2>
          <p className="text-[var(--ff-ink-muted)] mt-1">Manage ethical merchant partners</p>
        </div>
        <button
          onClick={onOpenModal}
          className="px-6 py-3 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Onboard Merchant
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Merchants" value={merchants.length} />
        <MetricCard label="Total Products" value={0} />
        <MetricCard label="Avg Ethical Score" value="4.0/5" />
        <MetricCard label="Pending Applications" value={0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {merchants.map((merchant) => (
          <div key={merchant.id} className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6 hover:border-[var(--ff-cta)] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[var(--ff-ink)] font-semibold">{merchant.businessName}</h3>
                <p className="text-sm text-[var(--ff-ink-muted)]">{merchant.email}</p>
              </div>
              <RoleBadge role={merchant.role} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Ethical Score</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < merchant.ethicalScore ? 'fill-[var(--ff-warning)] text-[var(--ff-warning)]' : 'text-[var(--ff-neutral-muted)]'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Status</span>
                <span className="text-[var(--ff-success)] font-semibold">{merchant.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Products</span>
                <span className="text-[var(--ff-ink)]">{merchant.products}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Member Since</span>
                <span className="text-[var(--ff-ink)]">{merchant.memberSince}</span>
              </div>
            </div>
          </div>
        ))}
        {merchants.length === 0 && (
          <div className="col-span-full bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-12 text-center">
            <p className="text-[var(--ff-ink-muted)] mb-4">No merchants onboarded yet</p>
            <button
              onClick={onOpenModal}
              className="px-6 py-3 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] rounded-lg font-semibold transition-colors"
            >
              Onboard First Merchant
            </button>
          </div>
        )}
      </div>

      {showOnboardModal && (
        <div className="fixed inset-0 bg-[var(--ff-neutral-bold)]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-[var(--ff-ink)] mb-4">Onboard New Merchant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Business Name *</label>
                <input
                  type="text"
                  value={onboardForm.businessName}
                  onChange={(e) => onUpdateField('businessName', e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border-light)] rounded-lg text-[var(--ff-form-text)] focus:outline-none focus:border-[var(--ff-focus)]"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Contact Email *</label>
                <input
                  type="email"
                  value={onboardForm.contactEmail}
                  onChange={(e) => onUpdateField('contactEmail', e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border-light)] rounded-lg text-[var(--ff-form-text)] focus:outline-none focus:border-[var(--ff-focus)]"
                  placeholder="merchant@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Category *</label>
                <select
                  value={onboardForm.category}
                  onChange={(e) => onUpdateField('category', e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border-light)] rounded-lg text-[var(--ff-form-text)] focus:outline-none focus:border-[var(--ff-focus)]"
                >
                  <option value="">Select category</option>
                  <option value="food">Food & Beverage</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="home">Home & Living</option>
                  <option value="beauty">Beauty & Wellness</option>
                  <option value="tech">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Ethical Certifications</label>
                <div className="space-y-2">
                  {['Fair Trade', 'Organic', 'B-Corp', 'Carbon Neutral', 'Local Sourced'].map((cert) => (
                    <label key={cert} className="flex items-center gap-2 text-[var(--ff-form-text)]">
                      <input
                        type="checkbox"
                        checked={onboardForm.certifications.includes(cert)}
                        onChange={(e) => onToggleCertification(cert, e.target.checked)}
                        className="rounded border-[var(--ff-border-light)] text-[var(--ff-cta)] focus:ring-[var(--ff-focus)]"
                      />
                      <span className="text-sm">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCloseModal}
                className="flex-1 px-4 py-2 bg-[var(--ff-neutral-subtle)] hover:bg-[var(--ff-neutral)] text-[var(--ff-ink)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="flex-1 px-4 py-2 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] rounded-lg font-semibold transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
