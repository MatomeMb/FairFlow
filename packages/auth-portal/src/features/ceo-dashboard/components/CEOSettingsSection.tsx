import { SprintStatus } from '../../../lib/statusBadges';

export function CEOSettingsSection() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-6">Company Configuration</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Company Name</label>
              <div className="text-[var(--ff-ink)] font-semibold">fairflow</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Version</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)] font-semibold">0.6.0</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-full">Latest</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Environment</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">Development</span>
                <span className="px-2 py-0.5 bg-[var(--ff-warning)] text-[var(--ff-neutral)] text-xs rounded-full">Dev</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Domain</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">fairflow.co.za</span>
                <span className="px-2 py-0.5 bg-[var(--ff-warning-bold)] text-[var(--ff-neutral)] text-xs rounded-full">Pending - Sprint 7</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Chrome Web Store</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink-muted)]">Not submitted</span>
                <span className="px-2 py-0.5 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 8</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Email Provider</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">Zoho Free</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-full">Sprint 7</span>
                <span className="text-[var(--ff-neutral-muted)] text-xs">-&gt; Stalwart (Sprint 12)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Talent Pipeline</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-success)] font-semibold">Active</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success-subtle)] text-[var(--ff-neutral)] text-xs rounded-full">CTO-managed</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">AI Agent</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink-muted)]">Not configured</span>
                <span className="px-2 py-0.5 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)]">Auth Configuration</h3>
          <span className="px-3 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink-muted)] text-sm rounded-full">Read-Only</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Auth Provider</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)] font-semibold">Supabase Auth</span>
                <SprintStatus status="complete" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Custom Hook</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">custom-access-token-hook</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-full">Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Roles Configured</label>
              <div className="text-[var(--ff-ink)] font-semibold">5 roles</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Permission Rules</label>
              <div className="text-[var(--ff-ink)] font-semibold">16 rules</div>
            </div>
          </div>

          <div className="border-t border-[var(--ff-border-light)] pt-4">
            <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-3">Authentication Methods</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-[var(--ff-neutral-bold)]">Google OAuth</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-lg font-medium"><SprintStatus status="complete" /></span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-[var(--ff-neutral-bold)]">Email/Password</span>
                <span><SprintStatus status="complete" /> Enabled</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-[var(--ff-neutral-bold)]">Phone/SMS</span>
                <span className="text-[var(--ff-neutral-muted)]">Not enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
