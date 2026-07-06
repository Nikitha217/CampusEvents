import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  FileText, Download, Users, BarChart3, Award,
  CheckCircle2, XCircle, TrendingUp, AlertCircle, ClipboardList
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList
} from "recharts";
import { Button } from "../../components/ui/button";
import reportService from "../../services/reportService";

/* =========================
   STYLE CONSTANTS
========================== */
const PIE_COLORS = ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#a855f7"];
const ATTENDANCE_COLORS = ["#22c55e", "#ef4444"]; // Present, Absent

// Truncate helper for long event names on Y-Axis
const truncateText = (text, maxLength = 20) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

/* =========================
   UI COMPONENTS
========================== */
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-${color}-500/10 border border-${color}-500/20 backdrop-blur-xl rounded-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-${color}-500/20 hover:-translate-y-1`}>
    <div className={`h-10 w-10 rounded-xl bg-${color}-500/20 border border-${color}-500/30 flex items-center justify-center mb-3`}>
      <Icon className={`h-5 w-5 text-${color}-400 drop-shadow-[0_0_8px_currentColor]`} />
    </div>
    <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
    <p className="text-slate-400 text-sm mt-1">{title}</p>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[340px] flex flex-col">
    <div className="w-1/3 h-5 bg-white/10 animate-pulse rounded mb-6" />
    <div className="flex-1 bg-white/5 animate-pulse rounded-xl" />
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl mt-8">
    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
      <AlertCircle className="h-10 w-10 text-slate-500" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No analytics data available</h3>
    <p className="text-sm max-w-md text-center">
      You haven't generated any analytics yet. Once students begin registering and attending your events, insightful charts will automatically appear here.
    </p>
  </div>
);

/* =========================
   MAIN COMPONENT
========================== */
const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await reportService.getReports();
      setData(res);
    } catch (error) {
      console.error("Failed to fetch reports", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /* ─── DATA MAPPING ───────────────────────────────────────────────────── */
  
  const hasData = data && data.totalEvents > 0;

  // 1. Registration Status (Pie)
  const pieData = data?.statusChart
    ? Object.entries(data.statusChart).map(([name, value]) => ({ name, value }))
    : [];

  // 2. Events by Category (Vertical Bar)
  const categoryData = data?.categoryChart
    ? Object.entries(data.categoryChart).map(([name, value]) => ({ name, value }))
    : [];

  // 3. Participants Per Event (Horizontal Bar)
  const participantsData = data?.eventParticipants
    ? Object.entries(data.eventParticipants).map(([name, participants]) => ({ name, participants }))
    : [];

  // 4. Attendance Overview (Doughnut)
  const totalPresent = data?.totalPresent || 0;
  const totalAbsent = data?.totalAbsent || 0;
  const totalAttendanceRecords = totalPresent + totalAbsent;
  
  const attendanceData = totalAttendanceRecords > 0 ? [
    { name: "Present", value: totalPresent },
    { name: "Absent", value: totalAbsent }
  ] : [];

  const attendanceRate = totalAttendanceRecords > 0 
    ? Math.round((totalPresent / totalAttendanceRecords) * 100) 
    : 0;

  /* ─── EXPORT PDF ─────────────────────────────────────────────────────── */
  const generatePDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, 220, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Campus Events — Analytics Report", 20, 22);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14); doc.text("Summary", 20, 50);
    doc.setFontSize(12);
    doc.text(`Total Events: ${data.totalEvents || 0}`, 20, 65);
    doc.text(`Total Registrations: ${data.totalRegistrations || 0}`, 20, 78);
    doc.text(`Approved Registrations: ${data.approvedRegistrations || 0}`, 20, 91);
    doc.text(`Present: ${data.totalPresent || 0}`, 20, 104);
    doc.text(`Absent: ${data.totalAbsent || 0}`, 20, 117);
    doc.text(`Attendance Rate: ${attendanceRate}%`, 20, 130);
    doc.text(`Certificates Issued: ${data.certificatesIssued || 0}`, 20, 143);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 285);
    doc.save("eventora-analytics.pdf");
  };

  /* ─── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            Reports & Analytics
          </h1>
          <p className="text-slate-400 mt-1 pl-11">Real-time campus event analytics from live data</p>
        </div>
        <Button 
          onClick={generatePDF} 
          disabled={!hasData || loading}
          className="bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50"
        >
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      {loading ? (
        // LOADING STATE
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 h-[120px] rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <ChartSkeleton /><ChartSkeleton />
            <ChartSkeleton /><ChartSkeleton />
          </div>
        </div>
      ) : !hasData ? (
        // EMPTY STATE
        <EmptyState />
      ) : (
        // DASHBOARD CONTENT
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Events" value={data.totalEvents} icon={ClipboardList} color="violet" />
            <StatCard title="Total Registrations" value={data.totalRegistrations} icon={Users} color="blue" />
            <StatCard title="Approved" value={data.approvedRegistrations} icon={CheckCircle2} color="emerald" />
            <StatCard title="Present" value={data.totalPresent} icon={TrendingUp} color="green" />
            <StatCard title="Absent" value={data.totalAbsent} icon={XCircle} color="rose" />
            <StatCard title="Certificates" value={data.certificatesIssued} icon={Award} color="amber" />
          </div>

          {/* ATTENDANCE PROGRESS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between text-sm mb-3">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <TrendingUp className="h-4 w-4 text-purple-400" /> Overall Attendance Rate
              </div>
              <span className="font-bold text-white bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                {attendanceRate}%
              </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${attendanceRate}%` }} 
              />
            </div>
          </div>

          {/* CHARTS GRID */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* 1. PARTICIPANTS PER EVENT */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
              <h2 className="text-lg font-bold text-white mb-5">Participants Per Event</h2>
              {participantsData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
              ) : (
                <div className="flex-1 min-h-[300px]" style={{ height: participantsData.length > 5 ? Math.max(300, participantsData.length * 45) : 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    {participantsData.length > 5 ? (
                      <BarChart data={participantsData} layout="vertical" margin={{ left: 0, right: 40, top: 10, bottom: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={160} 
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickFormatter={(val) => truncateText(val, 22)} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} 
                          formatter={(value) => [value, "Participants"]}
                        />
                        <Bar dataKey="participants" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24}>
                          <LabelList dataKey="participants" position="right" fill="#cbd5e1" fontSize={12} fontWeight="bold" />
                        </Bar>
                      </BarChart>
                    ) : (
                      <BarChart data={participantsData} layout="horizontal" margin={{ left: 10, right: 10, top: 30, bottom: 20 }}>
                        <XAxis 
                          type="category" 
                          dataKey="name" 
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          tickFormatter={(val) => truncateText(val, 15)} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis type="number" hide />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} 
                          formatter={(value) => [value, "Participants"]}
                        />
                        <Bar dataKey="participants" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40}>
                          <LabelList dataKey="participants" position="top" fill="#cbd5e1" fontSize={14} fontWeight="bold" />
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 2. ATTENDANCE OVERVIEW (DOUGHNUT) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
              <h2 className="text-lg font-bold text-white mb-5">Attendance Overview</h2>
              {attendanceData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
              ) : (
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={attendanceData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 3. REGISTRATION STATUS (PIE) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
              <h2 className="text-lg font-bold text-white mb-5">Registration Status</h2>
              {pieData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
              ) : (
                <div className="flex-1 min-h-[280px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        dataKey="value" 
                        nameKey="name" 
                        outerRadius={90}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(255,255,255,0.1)" />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 4. EVENTS BY CATEGORY (VERTICAL BAR) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
              <h2 className="text-lg font-bold text-white mb-5">Events by Category</h2>
              {categoryData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
              ) : (
                <div className="flex-1 min-h-[280px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData} margin={{ top: 20 }}>
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} 
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                        <LabelList dataKey="value" position="top" fill="#cbd5e1" fontSize={12} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>

          {/* SUMMARY LIST */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" /> Data Summary Export
            </h2>
            <div className="divide-y divide-white/5 bg-[#0F172A]/50 rounded-xl px-6 py-2 border border-white/5">
              {[
                { label: "Total Events Hosted",      value: data.totalEvents },
                { label: "Total Registrations",      value: data.totalRegistrations },
                { label: "Approved Registrations",   value: data.approvedRegistrations },
                { label: "Students Present",         value: data.totalPresent },
                { label: "Students Absent",          value: data.totalAbsent },
                { label: "Overall Attendance Rate",  value: `${attendanceRate}%` },
                { label: "Certificates Issued",      value: data.certificatesIssued },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-4">
                  <span className="text-slate-400 text-sm font-medium">{item.label}</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Reports;
