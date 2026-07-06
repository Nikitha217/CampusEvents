import { ScrollText, User, Calendar, Shield, Search, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getAuditLogs } from "../../services/auditLogService";

/**
 * AuditLogs
 *
 * FIX 1: Polling reduced from 10s → 30s to avoid spamming the backend.
 * FIX 2: Added search/filter bar (was missing).
 * FIX 3: Empty state and loading state added.
 * FIX 4: table row flex layout for icon+text was invalid (td can't be flex) → wrapped in div.
 */

const iconMap = {
  "User Login":             User,
  "Event Created":          Calendar,
  "Event Approved":         Shield,
  "Registration Approved":  User,
  "Certificate Issued":     Shield,
  "Feedback Submitted":     User,
};

const AuditLogs = () => {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const data = await getAuditLogs();
      setLogs(data || []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(() => loadLogs(), 30000);
    return () => clearInterval(interval);
  }, [loadLogs]);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.userName?.toLowerCase().includes(q) ||
      log.role?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          Loading audit logs...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 mt-1">Track all system activities</p>
        </div>
        <button
          onClick={() => loadLogs(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search by action, user or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
        />
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Action", "User", "Role", "Timestamp"].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-slate-500">
                    <ScrollText className="h-8 w-8 mx-auto mb-3 text-slate-600" />
                    {search ? "No logs match your search" : "No audit logs yet"}
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const Icon = iconMap[log.action] || ScrollText;
                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-200">
                          <Icon className="h-4 w-4 text-purple-400 flex-shrink-0" />
                          {log.action}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{log.userName}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                          {log.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
