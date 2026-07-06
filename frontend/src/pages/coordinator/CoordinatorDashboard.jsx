import { useState, useEffect } from "react";
import { Calendar, Users, ClipboardCheck, UserCheck, TrendingUp, Award } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/StatCard";

const CoordinatorDashboard = () => {
  const [stats, setStats] = useState({
    myEvents: 0, totalParticipants: 0, attended: 0, attendanceRate: 0,
    pendingRegistrations: 0, approvedRegistrations: 0 // Optional fields if you still want to calculate registration analytics
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      // ── NEW API CALL ──────────────────────────────────────────────────────────
      const response = await API.get("/coordinator/dashboard/stats");
      // Fallback for registration analytics if we still need them, but the user requested cards matching the new API
      setStats({
        ...response.data,
        pendingRegistrations: response.data.pendingRegistrations || 0,
        approvedRegistrations: response.data.approvedRegistrations || 0
      });
    } catch (error) {
      console.error("Failed to fetch coordinator dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          Loading Dashboard...
        </div>
      </div>
    );
  }

  // Fallback calculations for old sections
  const totalRegistrations = stats.pendingRegistrations + stats.approvedRegistrations;
  const approvalRate = totalRegistrations > 0 ? Math.round((stats.approvedRegistrations * 100) / totalRegistrations) : 0;
  
  // Use the backend-calculated attendanceRate
  const attendanceRate = stats.attendanceRate;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Coordinator Dashboard</h1>
        <p className="text-slate-400 mt-1">Manage events, registrations, attendance and participants</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="My Events" value={stats.myEvents} icon={Calendar} variant="primary" />
        <StatCard title="Total Participants" value={stats.totalParticipants} icon={Users} />
        <StatCard title="Attended" value={stats.attended} icon={UserCheck} variant="secondary" />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={ClipboardCheck} variant="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registration Analytics */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white text-lg">Registration Analytics</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-slate-400 mb-1">Pending</p>
              <h2 className="text-2xl font-bold text-amber-400">{stats.pendingRegistrations}</h2>
            </div>
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-slate-400 mb-1">Approved</p>
              <h2 className="text-2xl font-bold text-green-400">{stats.approvedRegistrations}</h2>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Approval Rate</span>
              <span className="font-semibold text-white">{approvalRate}%</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full transition-all duration-700" style={{ width: `${approvalRate}%` }} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Award className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-white text-lg">Summary</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total Events Created", value: stats.myEvents },
              { label: "Total Participants", value: stats.totalParticipants },
              { label: "Attended Participants", value: stats.attended },
              { label: "Attendance Rate", value: `${attendanceRate}%` },
              { label: "Approval Rate", value: `${approvalRate}%` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className="text-slate-400 text-sm">{item.label}</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
