import { SprintStatus } from '../../../lib/statusBadges';

export function CEOFinancialsSection() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Revenue Model Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border-light)]">
            <span className="text-[var(--ff-neutral-bold)]">Model Type</span>
            <span className="text-[var(--ff-ink)] font-semibold">Commission-based</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border-light)]">
            <span className="text-[var(--ff-neutral-bold)]">PayFast Integration</span>
            <span className="flex items-center gap-2">
              <SprintStatus status="upcoming" />
              <span className="text-[var(--ff-neutral-muted)] text-sm">(3.5% + R2 per transaction)</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border-light)]">
            <span className="text-[var(--ff-neutral-bold)]">Stripe Integration</span>
            <span className="flex items-center gap-2">
              <SprintStatus status="upcoming" />
              <span className="text-[var(--ff-neutral-muted)] text-sm">(2.9% + R5.50 per transaction)</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[var(--ff-neutral-bold)]">Commission Tracking</span>
            <SprintStatus status="upcoming" />
          </div>
        </div>
      </div>

      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Current Monthly Budget</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--ff-neutral-bold)]">Cursor AI Subscription</span>
            <span className="text-[var(--ff-ink)] font-mono">R665</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--ff-neutral-bold)]">Domain + Chrome Store</span>
            <span className="text-[var(--ff-ink)] font-mono">R170</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--ff-neutral-bold)]">Dev Tools & Services</span>
            <span className="text-[var(--ff-ink)] font-mono">R2,665</span>
          </div>
          <div className="border-t border-[var(--ff-border-light)] pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--ff-ink)]">Total</span>
              <span className="text-xl font-bold text-[var(--ff-success)]">R3,500</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[var(--ff-ink-muted)]">Remaining</span>
              <span className="text-[var(--ff-ink-muted)] font-mono">R0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Projected Monthly Operating Costs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--ff-bg)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--ff-ink-muted)] uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ff-border-mid)]">
              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">Supabase (Free Tier)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-lg font-medium"><SprintStatus status="complete" /></span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">R0</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">AI Chat (~estimated)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 9</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R90/mo</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">VPS Email (Stalwart)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 12</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R85/mo</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">Supabase Pro (&gt;50K users)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Future</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R450/mo</td>
              </tr>
              <tr className="bg-[var(--ff-bg)] font-semibold">
                <td className="px-4 py-3 text-[var(--ff-ink)]">Total Range</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right text-[var(--ff-success)]">R0 -&gt; R790/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
