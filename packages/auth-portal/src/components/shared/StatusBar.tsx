import { RefreshCw } from "lucide-react";

interface StatusBarProps {
  apiOnline: boolean;
  version: string;
  secondsSince?: number;
  onRefresh?: () => void;
  readOnly?: boolean;
}

export function StatusBar({ apiOnline, version, secondsSince, onRefresh, readOnly = false }: StatusBarProps) {
  return (
    <div className="bg-stone-900 border-b border-stone-800 px-6 py-3 flex items-center justify-between text-sm">
      <div className="flex items-center gap-6 text-stone-400">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          API: {apiOnline ? 'Online' : 'Offline'}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          DB: Connected
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Auth: Active
        </span>
        <span className="text-stone-500">{version}</span>
      </div>
      {!readOnly && (
        <div className="flex items-center gap-4">
          {typeof secondsSince === 'number' && (
            <span className="text-stone-500">
              Last refreshed: {secondsSince}s ago
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
