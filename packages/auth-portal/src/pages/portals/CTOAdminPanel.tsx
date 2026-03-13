import { Suspense, lazy, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useSupabaseUsers } from "../../hooks/useSupabaseUsers";
import { usePermissions } from "../../hooks/usePermissions";
import { formatBytes, truncateId } from "../../lib/format";
import { PortalShell } from "../../components/layout/PortalShell";
import { FairflowLogo } from "../../components/FairflowLogo";
import { StatusBar } from "../../components/shared/StatusBar";
import { MetricCard } from "../../components/shared/MetricCard";
import { RoleBadge } from "../../components/shared/RoleBadge";
import { ConfirmModal } from "../../components/shared/ConfirmModal";
import { Toast } from "../../components/shared/Toast";
import { EmptyState } from "../../components/shared/EmptyState";
import { OfflineBanner } from "../../components/shared/OfflineBanner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, BarChart2, Briefcase, Check, Circle, FileText } from "lucide-react";
import { SectionSkeleton } from "../../lib/statusBadges";
import type { AppRole } from "../../types/portal";

export function CTOAdminPanel() {
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Update page title
  useEffect(() => {
    document.title = 'fairflow — CTO Admin Panel';
  }, []);

  const navigation = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "User Management" },
    { id: "system", label: "System" },
    { id: "permissions", label: "Roles & Permissions" },
    { id: "logs", label: "Logs" },
    { id: "talent", label: "Talent Pipeline" },
  ];


  const handleClearCache = async () => {
    // MOCK: Real cache clear endpoint coming in Sprint 8
    setToast({ message: "Cache management coming in Sprint 8 with advanced analytics", type: "info" });
  };

  const handlePreAggregate = async () => {
    // MOCK: Real pre-aggregation endpoint coming in Sprint 8
    setToast({ message: "Pre-aggregation management coming in Sprint 8 with advanced analytics", type: "info" });
  };

  const OverviewSectionBase = ({
    onClearCache
  }: {
    onClearCache: () => void;
  }) => {
    const { data: analytics, error: apiError, secondsSince, refresh, checkHealth } = useAnalytics();
    const [apiOnline, setApiOnline] = useState(true);

    useEffect(() => {
      checkHealth().then(setApiOnline);
    }, [checkHealth]);

    if (apiError) {
      return (
        <>
          <OfflineBanner />
          <div className="p-6">
            <EmptyState
              icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />}
              title="API Offline"
              description="Cannot fetch analytics. Run: cd mcj && npm run demo, then refresh this panel."
              action={{ label: "Try Again", onClick: refresh }}
            />
          </div>
        </>
      );
    }

    return (
      <div>
        <StatusBar
          apiOnline={apiOnline}
          version="v0.6.0"
          secondsSince={secondsSince}
          onRefresh={refresh}
        />

        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Heap Memory" value={(analytics?.system.memoryHeap || 0).toFixed(2)} unit="MB" />
            <MetricCard label="RSS Memory" value={(analytics?.system.memoryRss || 0).toFixed(2)} unit="MB" />
            <MetricCard label="Storage Used" value={formatBytes(analytics?.storage.totalSize || 0)} />
            <MetricCard label="Errors (24h)" value={analytics?.errors.count || 0} color={analytics?.errors.count === 0 ? "green" : "red"} />
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Cache */}
            <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
              <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Query Cache</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Status</span>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-lg ${analytics?.cache.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    {analytics?.cache.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Hit Rate</span>
                  <span className="text-[var(--ff-ink)]">{analytics?.cache.hitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Hits / Misses</span>
                  <span className="text-[var(--ff-ink)]">{analytics?.cache.hits} / {analytics?.cache.misses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Entries</span>
                  <span className="text-[var(--ff-ink)]">{analytics?.cache.entries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Size</span>
                  <span className="text-[var(--ff-ink)]">{analytics?.cache.size} bytes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Evictions</span>
                  <span className="text-[var(--ff-ink)]">{analytics?.cache.evictions}</span>
                </div>
              </div>
              <button
                onClick={onClearCache}
                title="Cache management coming in Sprint 8"
                className="mt-4 w-full bg-stone-200/60 cursor-not-allowed text-stone-500 text-sm font-medium px-4 py-2 rounded-lg border border-[var(--ff-border)] transition-colors"
                disabled
              >
                Clear Cache (Sprint 8)
              </button>
            </div>

            {/* Storage Breakdown */}
            <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
              <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Storage Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Events</span>
                  <span className="text-[var(--ff-ink)] font-mono">{formatBytes(analytics?.storage.events || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Things</span>
                  <span className="text-[var(--ff-ink)] font-mono">{formatBytes(analytics?.storage.things || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Total</span>
                  <span className="text-[var(--ff-ink)] font-semibold">{formatBytes(analytics?.storage.totalSize || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Quota</span>
                  <span className="text-[var(--ff-ink)]">5.0 GB</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
              <div className="w-full bg-stone-100 rounded-lg h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-lg"
                    style={{ width: `${((analytics?.storage.totalSize || 0) / (5120 * 1024 * 1024)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {(((analytics?.storage.totalSize || 0) / (5120 * 1024 * 1024)) * 100).toFixed(4)}% used
                </p>
              </div>
            </div>
          </div>

          {/* Query Histogram */}
          <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
            <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Query Time Histogram</h3>
            {analytics && analytics.queryHistogram.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.queryHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
                  <XAxis dataKey="duration" stroke="#a8a29e" label={{ value: 'Duration (ms)', position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#a8a29e" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#292524', border: '1px solid #44403c' }} />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<BarChart2 className="w-10 h-10 text-stone-500" />}
                title="No queries recorded"
                description="System is in a clean state."
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const UserManagementSectionBase = ({
    onToast
  }: {
    onToast: (message: string, type: "success" | "error" | "info") => void;
  }) => {
    const { users, loading: usersLoading, updateRole, removeUser } = useSupabaseUsers();
    const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      danger?: boolean;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

    const handleRoleChange = async (userId: string, currentRole: AppRole, newRole: AppRole) => {
      setConfirmModal({
        isOpen: true,
        title: "Change User Role",
        message: `Change role from **${currentRole}** to **${newRole}**?`,
        onConfirm: async () => {
          try {
            await updateRole(userId, newRole);
            onToast("Role updated successfully", "success");
          } catch (error) {
            onToast(String(error), "error");
          }
          setConfirmModal({ ...confirmModal, isOpen: false });
        },
      });
    };

    const handleRemoveUser = async (id: string) => {
      setConfirmModal({
        isOpen: true,
        title: "Remove User Role",
        message: "Remove this user's role assignment? They will default to consumer on next login.",
        onConfirm: async () => {
          try {
            await removeUser(id);
            onToast("User role removed", "success");
          } catch (error) {
            onToast(String(error), "error");
          }
          setConfirmModal({ ...confirmModal, isOpen: false });
        },
        danger: true,
      });
    };

    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<AppRole, number>);

    return (
      <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[var(--ff-ink)]">Users & Roles ({users.length} total)</h2>
          <input
            type="text"
            placeholder="Search..."
            className="bg-white/70 border border-[var(--ff-border)] rounded-lg px-4 py-2 text-sm text-[var(--ff-ink)] placeholder-stone-500"
          />
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 text-sm">
          <span className="text-[var(--ff-ink-muted)]">CEO: <span className="text-[var(--ff-ink)]">{roleCounts.ceo || 0}</span></span>
          <span className="text-stone-500">|</span>
          <span className="text-[var(--ff-ink-muted)]">CTO: <span className="text-[var(--ff-ink)]">{roleCounts.cto || 0}</span></span>
          <span className="text-stone-500">|</span>
          <span className="text-[var(--ff-ink-muted)]">Merchants: <span className="text-[var(--ff-ink)]">{roleCounts.merchant || 0}</span></span>
          <span className="text-stone-500">|</span>
          <span className="text-[var(--ff-ink-muted)]">Investors: <span className="text-[var(--ff-ink)]">{roleCounts.investor || 0}</span></span>
          <span className="text-stone-500">|</span>
          <span className="text-[var(--ff-ink-muted)]">Consumers: <span className="text-[var(--ff-ink)]">{roleCounts.consumer || 0}</span></span>
        </div>

        {/* Users Table */}
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-100 border-b border-[var(--ff-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase tracking-wider">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">Loading...</td>
                </tr>
              ) : users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-stone-200/60 transition-colors">
                  <td className="px-4 py-3 text-sm text-[var(--ff-ink-muted)]">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-[var(--ff-ink)] font-mono">{truncateId(user.user_id)}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--ff-ink-muted)]">
                    {new Date(user.assigned_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.user_id, user.role, e.target.value as AppRole)}
                      className="bg-stone-100 border border-[var(--ff-border)] rounded px-2 py-1 text-xs text-[var(--ff-ink)]"
                    >
                      <option value="ceo">CEO</option>
                      <option value="cto">CTO</option>
                      <option value="merchant">Merchant</option>
                      <option value="investor">Investor</option>
                      <option value="consumer">Consumer</option>
                    </select>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800 rounded px-2 py-1 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Confirm"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        danger={confirmModal.danger}
      />
      </>
    );
  };

  const SystemSectionBase = ({
    onPreAggregate
  }: {
    onPreAggregate: () => void;
  }) => {
    const { data: analytics, checkHealth } = useAnalytics();
    const [apiOnline, setApiOnline] = useState(true);

    useEffect(() => {
      checkHealth().then(setApiOnline);
    }, [checkHealth]);

    return (
      <div className="p-6 space-y-6">
        {/* API Status */}
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">API Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--ff-ink-muted)]">Service:</span>
              <span className="text-[var(--ff-ink)] ml-2">shadow-index</span>
            </div>
            <div>
              <span className="text-[var(--ff-ink-muted)]">Company:</span>
              <span className="text-[var(--ff-ink)] ml-2">fairflow</span>
            </div>
            <div>
              <span className="text-[var(--ff-ink-muted)]">Version:</span>
              <span className="text-[var(--ff-ink)] ml-2">0.6.0</span>
            </div>
            <div>
              <span className="text-[var(--ff-ink-muted)]">Status:</span>
              <span className="text-[var(--ff-ink)] ml-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-lg ${apiOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                {apiOnline ? 'ok' : 'offline'}
              </span>
            </div>
            <div>
              <span className="text-[var(--ff-ink-muted)]">Timestamp:</span>
              <span className="text-[var(--ff-ink)] ml-2">{analytics?.lastUpdated || 'N/A'}</span>
            </div>
          </div>
          <button
            onClick={() => checkHealth().then(setApiOnline)}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Test Connection
          </button>
        </div>

        {/* Memory Monitor */}
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Memory Monitor</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--ff-ink-muted)]">Heap Memory</span>
                <span className="text-[var(--ff-ink)]">{(analytics?.system.memoryHeap || 0).toFixed(2)} MB</span>
              </div>
              <div className="w-full bg-stone-100 rounded-lg h-2">
                <div className="bg-blue-500 h-2 rounded-lg" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--ff-ink-muted)]">RSS Memory</span>
                <span className="text-[var(--ff-ink)]">{(analytics?.system.memoryRss || 0).toFixed(2)} MB</span>
              </div>
              <div className="w-full bg-stone-100 rounded-lg h-2">
                <div className="bg-purple-500 h-2 rounded-lg" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Aggregation */}
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Pre-Aggregation</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Status:</span>
              <span className="text-[var(--ff-ink)]">{analytics?.preAggregation.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Files:</span>
              <span className="text-[var(--ff-ink)]">{analytics?.preAggregation.files}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Last run:</span>
              <span className="text-[var(--ff-ink)]">{analytics?.preAggregation.lastRun || 'never'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Schedule:</span>
              <span className="text-[var(--ff-ink)]">npm run pre-aggregate | cron 00:00 UTC</span>
            </div>
          </div>
          <button
            onClick={onPreAggregate}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Run Now
          </button>
        </div>

        {/* Environment Info */}
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Environment Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Frontend Port:</span>
              <span className="text-[var(--ff-ink)]">5179</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">API Port:</span>
              <span className="text-[var(--ff-ink)]">3000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Supabase Project:</span>
              <span className="text-[var(--ff-ink)] font-mono text-xs">uxvmiyeulgenvxzaobdw</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Auth Hook:</span>
              <span className="text-[var(--ff-ink)] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> custom-access-token-hook (HTTPS)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">RBAC:</span>
              <span className="text-[var(--ff-ink)] flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 5 roles · 16 permissions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">JWT Claim:</span>
              <span className="text-[var(--ff-ink)]">user_role (injected on every login)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Build:</span>
              <span className="text-[var(--ff-ink)]">Vite + React + TypeScript + Tailwind v3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Stack:</span>
              <span className="text-[var(--ff-ink)]">Supabase Auth + PostgreSQL RLS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ff-ink-muted)]">Version:</span>
              <span className="text-[var(--ff-ink)]">0.6.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PermissionsSectionBase = () => {
    const { permissions, loading: permsLoading } = usePermissions();
    const resources = Array.from(new Set(permissions.map(p => p.resource)));
    const roles: AppRole[] = ["ceo", "cto", "merchant", "investor", "consumer"];

    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--ff-ink)]">RBAC Matrix — 16 permission rules across 5 roles</h2>

        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-100 border-b border-[var(--ff-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase">Resource</th>
                {roles.map(role => (
                  <th key={role} className="px-4 py-3 text-center text-xs font-medium text-[var(--ff-ink-muted)] uppercase">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {permsLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">Loading permissions...</td>
                </tr>
              ) : resources.map(resource => (
                <tr key={resource} className="hover:bg-stone-200/60">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--ff-ink)]">{resource}</td>
                  {roles.map(role => {
                    const perm = permissions.find(p => p.resource === resource && p.role === role);
                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        {perm ? (
                          <div className="flex justify-center gap-1" title={`select: ${perm.can_select ? 'yes' : 'no'} | insert: ${perm.can_insert ? 'yes' : 'no'} | update: ${perm.can_update ? 'yes' : 'no'} | delete: ${perm.can_delete ? 'yes' : 'no'}`}>
                            <Circle className={`w-2 h-2 fill-current ${perm.can_select ? 'text-emerald-400' : 'text-stone-700'}`} />
                            <Circle className={`w-2 h-2 fill-current ${perm.can_insert ? 'text-emerald-400' : 'text-stone-700'}`} />
                            <Circle className={`w-2 h-2 fill-current ${perm.can_update ? 'text-emerald-400' : 'text-stone-700'}`} />
                            <Circle className={`w-2 h-2 fill-current ${perm.can_delete ? 'text-emerald-400' : 'text-stone-700'}`} />
                          </div>
                        ) : (
                          <div className="flex justify-center gap-1">
                            <Circle className="w-2 h-2 fill-current text-stone-700" />
                            <Circle className="w-2 h-2 fill-current text-stone-700" />
                            <Circle className="w-2 h-2 fill-current text-stone-700" />
                            <Circle className="w-2 h-2 fill-current text-stone-700" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-6 text-xs text-[var(--ff-ink-muted)]">
          <span className="flex items-center gap-2"><Circle className="w-2 h-2 fill-current text-emerald-400" /> can_select</span>
          <span className="flex items-center gap-2"><Circle className="w-2 h-2 fill-current text-emerald-400" /> can_insert</span>
          <span className="flex items-center gap-2"><Circle className="w-2 h-2 fill-current text-emerald-400" /> can_update</span>
          <span className="flex items-center gap-2"><Circle className="w-2 h-2 fill-current text-emerald-400" /> can_delete</span>
        </div>

        <p className="text-sm text-stone-500 italic">
          Permissions enforced at PostgreSQL level via RLS. Changes require a SQL migration.
        </p>
      </div>
    );
  };

  const LogsSectionBase = () => {
    const { data: analytics, error: apiError, refresh } = useAnalytics();
    if (apiError) {
      return (
        <div className="p-6">
          <EmptyState
            icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />}
            title="API Offline"
            description="Cannot fetch logs. Run: cd mcj && npm run demo. Then refresh this panel."
            action={{ label: "Try Again", onClick: refresh }}
          />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        {/* Error Summary */}
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-2">Error Summary (24h)</h3>
          <div className="text-3xl font-bold tabular-nums mb-2">
            {analytics?.errors.count || 0} errors
          </div>
          <p className={analytics?.errors.count === 0 ? "text-green-400 flex items-center gap-2" : "text-red-400 flex items-center gap-2"}>
            {analytics?.errors.count === 0 ? <><Check className="w-4 h-4" /> All clear</> : <><AlertTriangle className="w-4 h-4" /> Review logs</>}
          </p>
        </div>

        {/* Query History */}
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--ff-border)]">
            <h3 className="text-xl font-semibold text-[var(--ff-ink)]">Query History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-100 border-b border-[var(--ff-border)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase">Params</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase">Results</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--ff-ink-muted)] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {analytics && analytics.recentQueries.length > 0 ? (
                  analytics.recentQueries.map((query, idx) => (
                    <tr key={idx} className="hover:bg-stone-200/60">
                      <td className="px-4 py-3 text-sm text-[var(--ff-ink)] font-mono">
                        {new Date(query.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--ff-ink)]">{query.duration}ms</td>
                      <td className="px-4 py-3 text-sm text-[var(--ff-ink-muted)] font-mono max-w-xs truncate">
                        {JSON.stringify(query.params).substring(0, 60)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--ff-ink)]">{query.results}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-md ${
                          query.status === 'success'
                            ? 'bg-green-900/50 text-green-400 border border-green-800'
                            : 'bg-red-900/50 text-red-400 border border-red-800'
                        }`}>
                          {query.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8">
                      <EmptyState
                        icon={<FileText className="w-10 h-10 text-stone-500" />}
                        title="No query history"
                        description="Recent queries will appear here."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const TalentSectionBase = () => {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--ff-ink)]">Talent Pipeline</h2>
            <p className="text-sm text-[var(--ff-ink-muted)] mt-1">Manage potential candidates for future hiring</p>
          </div>
          <button className="inline-flex items-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            Add Candidate
          </button>
        </div>

        <div className="bg-white/70 rounded-xl border border-[var(--ff-border)]/60 overflow-hidden">
          <div className="p-6 border-b border-[var(--ff-border)]/60">
            <p className="text-sm text-[var(--ff-ink-muted)]">
              Coming in Sprint 8: Talent database for tracking candidates, managing interviews, and building your hiring pipeline.
            </p>
          </div>
          <div className="p-12">
            <EmptyState
              icon={<Briefcase className="w-10 h-10 text-stone-500" />}
              title="No candidates yet"
              description="Start building your talent pipeline by adding potential team members for future roles."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/70 rounded-xl border border-[var(--ff-border)]/60 p-5">
            <div className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-2">Potential</div>
            <div className="text-3xl font-bold text-stone-200">0</div>
          </div>
          <div className="bg-white/70 rounded-xl border border-[var(--ff-border)]/60 p-5">
            <div className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-2">Interviewing</div>
            <div className="text-3xl font-bold text-yellow-400">0</div>
          </div>
          <div className="bg-white/70 rounded-xl border border-[var(--ff-border)]/60 p-5">
            <div className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-2">Hired</div>
            <div className="text-3xl font-bold text-emerald-400">0</div>
          </div>
        </div>
      </div>
    );
  };

  const OverviewSection = lazy(() => Promise.resolve({ default: OverviewSectionBase }));
  const UserManagementSection = lazy(() => Promise.resolve({ default: UserManagementSectionBase }));
  const SystemSection = lazy(() => Promise.resolve({ default: SystemSectionBase }));
  const PermissionsSection = lazy(() => Promise.resolve({ default: PermissionsSectionBase }));
  const LogsSection = lazy(() => Promise.resolve({ default: LogsSectionBase }));
  const TalentSection = lazy(() => Promise.resolve({ default: TalentSectionBase }));

  return (
    <>
      <PortalShell
        title={<FairflowLogo markHeight={32} variant="dark" />}
        version="v0.6.0"
        nav={navigation}
        activeSection={activeSection}
        onNavChange={setActiveSection}
        onLogout={signOut}
      >
        <Suspense fallback={<SectionSkeleton />}>
          {activeSection === "overview" && (
            <OverviewSection onClearCache={handleClearCache} />
          )}
          {activeSection === "users" && (
            <UserManagementSection onToast={(message, type) => setToast({ message, type })} />
          )}
          {activeSection === "system" && (
            <SystemSection onPreAggregate={handlePreAggregate} />
          )}
          {activeSection === "permissions" && <PermissionsSection />}
          {activeSection === "logs" && <LogsSection />}
          {activeSection === "talent" && <TalentSection />}
        </Suspense>
      </PortalShell>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
