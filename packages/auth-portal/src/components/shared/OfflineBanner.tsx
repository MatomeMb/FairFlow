import { AlertTriangle } from "lucide-react";

export function OfflineBanner() {
  return (
    <div className="bg-[var(--ff-warning-bg)]/50 border-b border-[var(--ff-warning-border)] px-6 py-3">
      <div className="flex items-center gap-2 text-[var(--ff-warning)] text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span>API Offline — Ensure demo server is running: <code className="bg-black/30 px-2 py-0.5 rounded">npm run demo</code> (port 3000)</span>
      </div>
    </div>
  );
}
