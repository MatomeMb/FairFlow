import { RoleBadge } from '../../../components/shared/RoleBadge';
import type { AppRole } from '../../../types/portal';

interface MerchantSummary {
  id: string;
  role: AppRole;
}

export interface AdminMerchantsSectionProps {
  merchants: MerchantSummary[];
}

export function AdminMerchantsSection({ merchants }: AdminMerchantsSectionProps) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-[var(--ff-ink)]">Merchant Management</h2>
      <div className="space-y-4">
        {merchants.map((merchant) => (
          <div key={merchant.id} className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--ff-ink)]">{merchant.id}</p>
                <p className="text-sm text-stone-700">{merchant.role}</p>
              </div>
              <RoleBadge role={merchant.role} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
