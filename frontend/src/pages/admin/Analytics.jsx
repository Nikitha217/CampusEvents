import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  AreaChart, Area,
  CartesianGrid,
  RadialBarChart, RadialBar,
} from "recharts";
import {
  Users, Calendar, ClipboardCheck, Award, Star, TrendingUp,
  RefreshCw, AlertCircle, Activity, BarChart3,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
────────────────────────────────────────────────────────────────────────── */
const PIE_COLORS  = ["#7c3aed", "#a855f7", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e"];
const CHART_TOOLTIP_STYLE = {
  background: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "13px",
};

/* ──────────────────────────────────────────────────────────────────────────
   SAFE HELPERS  (prevent crashes from null / undefined values)
────────────────────────────────────────────────────────────────────────── */
const safe = (val, fallback = 0) => (val ?? fallback);
const safeFixed = (val, digits = 1) => Number(val ?? 0).toFixed(digits);
const safeArr  = (arr) => (Array.isArray(arr) ? arr : []);
const safeMap  = (obj) =>
  obj && typeof obj === "object"
    ? Object.entries(obj).map(([name, value]) => ({ name, value: Number(value) || 0 }))
    : [];

/* ──────────────────────────────────────────────────────────────────────────
   COUNT-UP HOOK  (animates numbers from 0 to target)
────────────────────────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

/* ──────────────────────────────────────────────────────────────────────────
   SKELETON LOADER
────────────────────────────────────────────────────────────────────────── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const SkeletonDashboard = () => (
  <div className="space-y-8">
    <div className="space-y-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────
   ANIMATED STAT CARD
────────────────────────────────────────────────────────────────────────── */
const STAT_THEMES = {
  purple: {
    grad: "from-purple-600/20 to-purple-900/10",
    border: "border-purple-500/20",
    icon: "bg-purple-500/20 text-purple-400",
    text: "text-purple-400",
    glow: "shadow-purple-500/10",
  },
  blue: {
    grad: "from-blue-600/20 to-blue-900/10",
    border: "border-blue-500/20",
    icon: "bg-blue-500/20 text-blue-400",
    text: "text-blue-400",
    glow: "shadow-blue-500/10",
  },
  green: {
    grad: "from-green-600/20 to-green-900/10",
    border: "border-green-500/20",
    icon: "bg-green-500/20 text-green-400",
    text: "text-green-400",
    glow: "shadow-green-500/10",
  },
  amber: {
    grad: "from-amber-600/20 to-amber-900/10",
    border: "border-amber-500/20",
    icon: "bg-amber-500/20 text-amber-400",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  rose: {
    grad: "from-rose-600/20 to-rose-900/10",
    border: "border-rose-500/20",
    icon: "bg-rose-500/20 text-rose-400",
    text: "text-rose-400",
    glow: "shadow-rose-500/10",
  },
  cyan: {
    grad: "from-cyan-600/20 to-cyan-900/10",
    border: "border-cyan-500/20",
    icon: "bg-cyan-500/20 text-cyan-400",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
};

const StatCard = ({ icon: Icon, label, numericValue, displayValue, theme = "purple", suffix = "" }) => {
  const animated = useCountUp(numericValue ?? 0);
  const t = STAT_THEMES[theme] || STAT_THEMES.purple;

  return (
    <div
      className={`
        relative overflow-hidden group
        bg-gradient-to-br ${t.grad} border ${t.border}
        rounded-2xl p-5 shadow-lg ${t.glow}
        transition-all duration-300
        hover:scale-[1.03] hover:shadow-xl
        cursor-default
      `}
    >
      {/* Glow orb */}
      <div className={`
        absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10
        bg-gradient-to-br ${t.grad} blur-xl
        group-hover:opacity-20 transition-opacity duration-300
      `} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className={`text-3xl font-bold text-white tabular-nums`}>
        {displayValue !== undefined
          ? displayValue
          : `${animated}${suffix}`}
      </p>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   CHART CARD WRAPPER
────────────────────────────────────────────────────────────────────────── */
const ChartCard = ({ title, subtitle, children }) => (
  <div className="
    bg-white/[0.03] backdrop-blur-xl
    border border-white/10 rounded-2xl p-6
    shadow-lg shadow-purple-500/5
    hover:border-white/20 transition-all duration-300
  ">
    <div className="mb-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────
   EMPTY STATE  (shown when an individual chart has no data)
────────────────────────────────────────────────────────────────────────── */
const EmptyChart = ({ height = 240 }) => (
  <div
    className="flex flex-col items-center justify-center text-slate-600 text-sm gap-2"
    style={{ height }}
  >
    <BarChart3 className="w-8 h-8 opacity-30" />
    <span>No data yet</span>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────
   ATTENDANCE RADIAL
────────────────────────────────────────────────────────────────────────── */
const AttendanceRadial = ({ rate }) => {
  const data = [{ name: "Attendance", value: rate, fill: "#7c3aed" }];
  return (
    <div className="flex flex-col items-center gap-2">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="60%" outerRadius="90%"
          barSize={18}
          data={data}
          startAngle={90} endAngle={-270}
        >
          <RadialBar
            minAngle={5}
            background={{ fill: "rgba(255,255,255,0.05)" }}
            clockWise
            dataKey="value"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <p className="text-3xl font-bold text-white -mt-8">{safeFixed(rate, 1)}%</p>
      <p className="text-xs text-slate-500">Attendance Rate</p>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   CUSTOM TOOLTIP (shared across charts)
────────────────────────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={CHART_TOOLTIP_STYLE} className="px-3 py-2">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || "#a78bfa" }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   MAIN ANALYTICS PAGE
────────────────────────────────────────────────────────────────────────── */
const Analytics = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      console.debug("[Analytics] → GET /api/analytics");
      const response = await API.get("/analytics");
      console.debug("[Analytics] ← response.data:", response.data);

      // The api.js interceptor already unwraps ApiResponse.data → response.data
      // so we get the AnalyticsResponse object directly.
      setStats(response.data);
    } catch (err) {
      console.error("[Analytics] fetch failed:", err?.response?.status, err?.response?.data ?? err.message);
      setError(err?.response?.data || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  /* ── Loading state ──────────────────────────────────────────────────────── */
  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SkeletonDashboard />
    </div>
  );

  /* ── Error state ────────────────────────────────────────────────────────── */
  if (error) return (
    <div className="flex flex-col items-center justify-center h-72 gap-5">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-rose-400" />
      </div>
      <div className="text-center">
        <p className="text-white font-semibold">Failed to load analytics</p>
        <p className="text-slate-500 text-sm mt-1">{typeof error === "string" ? error : "Please try again."}</p>
      </div>
      <button
        onClick={fetchAnalytics}
        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
      >
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  /* ── Null safety — should never happen after loading=false without error ── */
  const s = stats || {};

  // Scalar values (null-safe)
  const avgRating      = safeFixed(s.averageRating, 1);
  const attendanceRate = Number(safe(s.attendanceRate, 0));

  // Chart data arrays (null-safe)
  const overviewData = [
    { name: "Users",         value: safe(s.totalUsers) },
    { name: "Events",        value: safe(s.totalEvents) },
    { name: "Registrations", value: safe(s.totalRegistrations) },
    { name: "Certificates",  value: safe(s.totalCertificates) },
  ];

  const roleData     = safeMap(s.roleDistribution);
  const categoryData = safeMap(s.categoryStats);

  // Monthly trend arrays: [{month, count}] → recharts needs [{month, count}]
  const monthlyEventsData = safeArr(s.monthlyEvents).map(d => ({
    month: d?.month ?? "",
    count: Number(d?.count ?? 0),
  }));
  const monthlyRegsData = safeArr(s.monthlyRegistrations).map(d => ({
    month: d?.month ?? "",
    count: Number(d?.count ?? 0),
  }));

  // Attendance radial data
  const radialAttendance = [
    { name: "Attendance", value: attendanceRate, fill: "#7c3aed" },
  ];

  return (
    <div className="space-y-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-slate-400 mt-1 text-sm">System-wide metrics and insights</p>
        </div>
        <button
          onClick={fetchAnalytics}
          title="Refresh analytics"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          numericValue={safe(s.totalUsers)}
          theme="purple"
        />
        <StatCard
          icon={Calendar}
          label="Total Events"
          numericValue={safe(s.totalEvents)}
          theme="blue"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Registrations"
          numericValue={safe(s.totalRegistrations)}
          theme="green"
        />
        <StatCard
          icon={Award}
          label="Certificates"
          numericValue={safe(s.totalCertificates)}
          theme="amber"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          numericValue={0}
          displayValue={`${avgRating} ⭐`}
          theme="rose"
        />
        <StatCard
          icon={TrendingUp}
          label="Attendance"
          numericValue={0}
          displayValue={`${safeFixed(attendanceRate, 1)}%`}
          theme="cyan"
        />
      </div>

      {/* ── Attendance progress bar ───────────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex justify-between text-sm mb-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="w-4 h-4" />
            <span>Overall Attendance Rate</span>
          </div>
          <span className="font-bold text-purple-300">{safeFixed(attendanceRate, 1)}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(attendanceRate, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1.5">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Charts row 1: Overview + Role Distribution ───────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Platform Overview Bar */}
        <ChartCard title="Platform Overview" subtitle="Total counts across all entities">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={overviewData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Role Distribution Pie */}
        <ChartCard title="User Role Distribution" subtitle="Breakdown by assigned role">
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    percent > 0.02 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

      </div>

      {/* ── Charts row 2: Categories + Monthly Events ─────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Event Categories Bar */}
        <ChartCard title="Events by Category" subtitle="Number of events per category">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} barGap={6}>
                <defs>
                  <linearGradient id="catGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" name="Events" fill="url(#catGrad)" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        {/* Monthly Events Area Chart */}
        <ChartCard title="Monthly Events Trend" subtitle="Events created per month (last 12 months)">
          {monthlyEventsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyEventsData}>
                <defs>
                  <linearGradient id="eventsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Events"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#eventsGrad)"
                  dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

      </div>

      {/* ── Charts row 3: Monthly Registrations + Attendance Radial ──────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Monthly Registrations Line Chart */}
        <ChartCard title="Monthly Registrations" subtitle="Student registrations per month">
          {monthlyRegsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyRegsData}>
                <defs>
                  <linearGradient id="regsGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Registrations"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        {/* Attendance Radial */}
        <ChartCard title="Attendance Overview" subtitle="Overall attendance rate across all events">
          <div className="flex flex-col items-center py-2">
            <ResponsiveContainer width="100%" height={190}>
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="58%" outerRadius="88%"
                barSize={16}
                data={radialAttendance}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={5}
                  background={{ fill: "rgba(255,255,255,0.04)" }}
                  clockWise
                  dataKey="value"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-6">
              <p className="text-4xl font-bold text-white">{safeFixed(attendanceRate, 1)}%</p>
              <p className="text-slate-500 text-sm mt-1">
                {attendanceRate < 50 ? "📈 Room to improve" : attendanceRate < 80 ? "👍 Good engagement" : "🎉 Excellent turnout"}
              </p>
            </div>
          </div>
        </ChartCard>

      </div>

      {/* ── Summary insights footer ───────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Events per User",
            value: safe(s.totalUsers) > 0
              ? (safe(s.totalEvents) / safe(s.totalUsers)).toFixed(2)
              : "—",
            sub: "Avg events created per user",
          },
          {
            label: "Registrations per Event",
            value: safe(s.totalEvents) > 0
              ? (safe(s.totalRegistrations) / safe(s.totalEvents)).toFixed(1)
              : "—",
            sub: "Avg registrations per event",
          },
          {
            label: "Certificate Issuance Rate",
            value: safe(s.totalRegistrations) > 0
              ? `${((safe(s.totalCertificates) / safe(s.totalRegistrations)) * 100).toFixed(1)}%`
              : "—",
            sub: "% of registrations with cert",
          },
          {
            label: "Average Rating",
            value: `${avgRating} / 5`,
            sub: "Across all event feedback",
          },
        ].map((insight, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all duration-200"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{insight.label}</p>
            <p className="text-2xl font-bold text-white">{insight.value}</p>
            <p className="text-xs text-slate-600 mt-1">{insight.sub}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Analytics;
