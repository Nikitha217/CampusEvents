import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import { 
  Users, Calendar, Shield, BarChart3, Activity, CheckCircle,
  UserPlus, FilePlus, Award, UserCheck, ShieldAlert, BookOpen, Clock
} from "lucide-react";
import API from "../../services/api";

// Helper to format relative time
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = new Date() - new Date(dateStr);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

// Map activity type to icon
const getActivityIcon = (type) => {
  switch (type?.toUpperCase()) {
    case "USER": return <UserPlus className="h-5 w-5 text-blue-400" />;
    case "EVENT": return <Calendar className="h-5 w-5 text-purple-400" />;
    case "CERTIFICATE": return <Award className="h-5 w-5 text-yellow-400" />;
    case "REGISTRATION": return <BookOpen className="h-5 w-5 text-green-400" />;
    default: return <Activity className="h-5 w-5 text-slate-400" />;
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, totalEvents: 0, pendingEvents: 0, approvedEvents: 0, registrations: 0 
  });
  
  const [activityData, setActivityData] = useState({
    newUsersToday: 0,
    newEventsToday: 0,
    pendingApprovals: 0,
    approvedToday: 0,
    activeStudents: 0,
    activeCoordinators: 0,
    certificatesIssuedToday: 0,
    recentActivities: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const activityRes = await API.get("/dashboard/admin/activity");
        
        // Map the single API response to both state objects
        const data = activityRes.data;
        setStats({
          totalUsers: data.totalUsers,
          totalEvents: data.totalEvents,
          pendingEvents: data.pendingApprovals,
          approvedEvents: data.approvedEvents,
          registrations: data.registrations
        });
        setActivityData(data);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-8 bg-white/10 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl border border-white/10"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white/5 rounded-2xl border border-white/10"></div>
          <div className="h-80 bg-white/5 rounded-2xl border border-white/10"></div>
        </div>
      </div>
    );
  }

  const approvalPct = stats.totalEvents > 0 ? Math.round((stats.approvedEvents / stats.totalEvents) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">System overview and real-time insights</p>
      </div>

      {/* Top Stat Cards (Original) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} variant="primary" />
        <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} />
        <StatCard title="Pending Approvals" value={stats.pendingEvents} icon={Shield} variant="accent" />
        <StatCard title="Total Registrations" value={stats.registrations} icon={BarChart3} />
      </div>

      {/* Real-time Insights & Activities */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Key Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-Time Insights</h3>
                <p className="text-xs text-slate-400">Metrics for today</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                <UserPlus className="h-5 w-5 text-indigo-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activityData.newUsersToday}</p>
                <p className="text-xs text-slate-400">New Users Today</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                <FilePlus className="h-5 w-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activityData.newEventsToday}</p>
                <p className="text-xs text-slate-400">New Events Today</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activityData.approvedToday}</p>
                <p className="text-xs text-slate-400">Events Approved Today</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                <ShieldAlert className="h-5 w-5 text-amber-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activityData.pendingApprovals}</p>
                <p className="text-xs text-slate-400">Total Pending Approvals</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                <UserCheck className="h-5 w-5 text-teal-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activityData.activeStudents}</p>
                <p className="text-xs text-slate-400">Active Students</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                <Award className="h-5 w-5 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activityData.certificatesIssuedToday}</p>
                <p className="text-xs text-slate-400">Certificates Issued Today</p>
              </div>
            </div>
          </div>

          {/* Event Approval Status */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Overall Event Approval Status</h3>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Approved Events</span>
                  <span className="font-semibold text-white">{stats.approvedEvents}/{stats.totalEvents}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full transition-all duration-700 shadow-lg shadow-purple-500/30"
                    style={{ width: `${approvalPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{approvalPct}% approval rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-purple-500/10 flex flex-col max-h-[600px]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white">Recent Activities</h3>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {activityData.recentActivities && activityData.recentActivities.length > 0 ? (
              activityData.recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="relative flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10 group-hover:bg-white/10 group-hover:scale-110 transition-all">
                      {getActivityIcon(activity.type)}
                    </div>
                    {index !== activityData.recentActivities.length - 1 && (
                      <div className="w-px h-full bg-white/10 absolute top-10" />
                    )}
                  </div>
                  <div className="pt-2 pb-4">
                    <p className="text-sm text-slate-200">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{timeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Activity className="h-8 w-8 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">No recent activities found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
