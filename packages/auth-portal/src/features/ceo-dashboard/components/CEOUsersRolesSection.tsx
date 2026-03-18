import { MetricCard } from '../../../components/shared/MetricCard';
import { RoleBadge } from '../../../components/shared/RoleBadge';
import { Lock, RefreshCw } from 'lucide-react';
import type { UserRole } from '../../../types/portal';

interface CEORoleStats {
  ceo: number;
  cto: number;
  merchant: number;
  investor: number;
  consumer: number;
}

interface CEOUsersRolesSectionProps {
  users: UserRole[];
  usersLoading: boolean;
  roleStats: CEORoleStats;
  onRefreshUsers: () => void;
}

export function CEOUsersRolesSection({ users, usersLoading, roleStats, onRefreshUsers }: CEOUsersRolesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Users" value={users.length} />
        <MetricCard label="Active Today" value={users.length} />
        <MetricCard label="Pending Invites" value={0} />
      </div>

      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-4">Role Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { role: 'CEO', count: roleStats.ceo, color: 'bg-[var(--ff-primary)]' },
            { role: 'CTO', count: roleStats.cto, color: 'bg-[var(--ff-info)]' },
            { role: 'Merchant', count: roleStats.merchant, color: 'bg-[var(--ff-success)]' },
            { role: 'Investor', count: roleStats.investor, color: 'bg-[var(--ff-warning)]' },
            { role: 'Consumer', count: roleStats.consumer, color: 'bg-[var(--ff-primary-hover)]' },
          ].map((item) => (
            <div key={item.role} className="text-center">
              <div className={`${item.color} rounded-lg p-4 mb-2`}>
                <div className="text-2xl font-bold text-[var(--ff-ink)]">{item.count}</div>
              </div>
              <div className="text-sm text-[var(--ff-ink-muted)]">{item.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)]">
        <div className="p-6 border-b border-[var(--ff-border-light)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--ff-ink)]">All Users</h3>
            <p className="text-sm text-[var(--ff-ink-muted)] mt-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--ff-warning)]" />
              Read-only view - Role changes managed by CTO
            </p>
          </div>
          <button
            onClick={onRefreshUsers}
            className="h-9 px-4 bg-[var(--ff-neutral-subtle)] hover:bg-[var(--ff-neutral)]/70 text-[var(--ff-ink)] rounded-lg transition-colors focus:ring-2 focus:ring-[var(--ff-focus)]/50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--ff-bg)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ff-border-mid)]">
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--ff-ink-muted)]">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--ff-ink-muted)]">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--ff-neutral-subtle)]">
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--ff-ink)] font-medium">{user.user_id.substring(0, 24)}...</div>
                      <div className="text-xs text-[var(--ff-neutral-muted)]">{user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--ff-ink-muted)]">{new Date(user.assigned_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button disabled title="Role changes managed by CTO" className="text-[var(--ff-neutral-muted)] cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5 text-[var(--ff-warning)]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
