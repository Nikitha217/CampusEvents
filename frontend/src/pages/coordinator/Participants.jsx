import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  Download,
  Check,
  X
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import participantService from "../../services/participantService";

/* =========================
   UI COMPONENTS
========================== */
const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className={`bg-[#0F172A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-white/10 hover:-translate-y-1 group`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 backdrop-blur-md border border-white/5 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-').replace('/20', '')} drop-shadow-[0_0_8px_currentColor]`} />
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-white/10 animate-pulse rounded-lg mt-1" />
      ) : (
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      )}
    </div>
  </div>
);

const SelectBox = ({ value, onChange, options, placeholder, icon: Icon }) => (
  <div className="relative flex-1 min-w-[160px]">
    {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />}
    <select
      value={value}
      onChange={onChange}
      className={`w-full rounded-xl ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm appearance-none bg-[#0F172A]/80 border border-white/10 text-slate-300 focus:outline-none focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 transition-all cursor-pointer`}
    >
      {placeholder && <option value="ALL" className="bg-[#1E293B]">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#1E293B]">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/* =========================
   MAIN DASHBOARD
========================== */
const Participants = () => {
  const { toast } = useToast();

  // Data States
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");
  const [eventFilter, setEventFilter] = useState("ALL");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use ref to prevent strict mode double fetching
  const hasFetched = useRef(false);

  // Only call backend ONCE on load!
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const loadParticipants = async () => {
      try {
        setLoading(true);
        // First get events to populate the dropdown filter and find eventIds
        const myEvents = await eventService.getMyEvents();
        setEvents(myEvents);
        
        if (myEvents.length > 0) {
          const eventIds = myEvents.map(e => e.id).join(',');
          // We use the export API because it returns the FULL list without server-side pagination,
          // allowing us to perform client-side searching, filtering, and pagination!
          const allParticipants = await participantService.exportParticipants({ eventIds });
          
          // Ensure we always have an array
          const rawData = allParticipants?.data || allParticipants || [];
          setParticipants(Array.isArray(rawData) ? rawData : []);
        } else {
          setParticipants([]);
        }
      } catch (error) {
        console.error("Failed to fetch initial participants", error);
        toast({ title: "Failed to fetch participants data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, [toast]);

  // Client-Side Searching & Filtering
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      // Event filter
      if (eventFilter !== "ALL" && p.eventId !== eventFilter) return false;
      
      // Status filter
      if (statusFilter !== "ALL" && p.status?.toUpperCase() !== statusFilter) return false;
      
      // Attendance filter
      if (attendanceFilter !== "ALL" && p.attendanceStatus?.toUpperCase() !== attendanceFilter) return false;
      
      // Search text (Name, Email, Event Title)
      if (search) {
        const s = search.toLowerCase();
        const matchesName = p.studentName?.toLowerCase().includes(s);
        const matchesEmail = p.studentEmail?.toLowerCase().includes(s);
        const matchesEvent = p.eventTitle?.toLowerCase().includes(s);
        if (!matchesName && !matchesEmail && !matchesEvent) return false;
      }
      
      return true;
    });
  }, [participants, eventFilter, statusFilter, attendanceFilter, search]);

  // Client-Side Statistics (Calculated locally instantly)
  const stats = useMemo(() => {
    const s = { total: 0, approved: 0, pending: 0, rejected: 0, present: 0, absent: 0 };
    filteredParticipants.forEach(p => {
      s.total++;
      if (p.status?.toUpperCase() === "APPROVED") s.approved++;
      if (p.status?.toUpperCase() === "PENDING") s.pending++;
      if (p.status?.toUpperCase() === "REJECTED") s.rejected++;
      
      if (p.attendanceStatus?.toUpperCase() === "PRESENT") s.present++;
      if (p.attendanceStatus?.toUpperCase() === "ABSENT") s.absent++;
    });
    return s;
  }, [filteredParticipants]);

  // Client-Side Pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, attendanceFilter, eventFilter, itemsPerPage]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredParticipants.slice(start, start + itemsPerPage);
  }, [filteredParticipants, currentPage, itemsPerPage]);

  // Handle Approve Registration
  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await registrationService.approveRegistration(id);
      
      // Mutate local state instantly to provide immediate UI feedback!
      setParticipants(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, status: "APPROVED" };
        }
        return p;
      }));
      toast({ title: "Registration Approved successfully" });
    } catch (error) {
      console.error("Failed to approve", error);
      toast({ title: "Failed to approve registration", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject Registration
  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await registrationService.rejectRegistration(id);
      
      // Mutate local state instantly to provide immediate UI feedback!
      setParticipants(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, status: "REJECTED" };
        }
        return p;
      }));
      toast({ title: "Registration Rejected successfully", variant: "destructive" });
    } catch (error) {
      console.error("Failed to reject", error);
      toast({ title: "Failed to reject registration", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportCSV = useCallback(() => {
    if (filteredParticipants.length === 0) return;
    try {
      toast({ title: "Preparing export...", duration: 2000 });
      
      const rows = [
        ["Name", "Email", "Event", "Registration Status", "Attendance Status"],
        ...filteredParticipants.map((p) => [p.studentName, p.studentEmail, p.eventTitle, p.status, p.attendanceStatus]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event_participants_${new Date().getTime()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  }, [filteredParticipants, toast]);

  // UI Helpers
  const statusBadge = {
    APPROVED: "bg-green-500/20 text-green-300 border-green-500/30",
    PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-400" />
            Participants Dashboard
          </h1>
          <p className="text-slate-400 mt-1 pl-11">
            Real-time insights and management for your event registrations.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={loading || filteredParticipants.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Registrations" value={stats.total} icon={BarChart3} color="bg-blue-500/20" loading={loading} />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} color="bg-green-500/20" loading={loading} />
        <StatCard title="Pending Approvals" value={stats.pending} icon={Clock3} color="bg-yellow-500/20" loading={loading} />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500/20" loading={loading} />
        <StatCard title="Present" value={stats.present} icon={UserCheck} color="bg-emerald-500/20" loading={loading} />
        <StatCard title="Absent" value={stats.absent} icon={UserX} color="bg-rose-500/20" loading={loading} />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row flex-wrap gap-4 items-center">
        
        <div className="relative flex-1 min-w-[200px] w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search participants, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-[#0F172A]/80 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 transition-all"
          />
        </div>

        <SelectBox
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          placeholder="All Events"
          icon={Filter}
          options={events.map(e => ({ value: e.id, label: e.title }))}
        />

        <SelectBox
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Statuses"
          options={[
            { value: "APPROVED", label: "Approved" },
            { value: "PENDING", label: "Pending" },
            { value: "REJECTED", label: "Rejected" }
          ]}
        />

        <SelectBox
          value={attendanceFilter}
          onChange={(e) => setAttendanceFilter(e.target.value)}
          placeholder="All Attendance"
          options={[
            { value: "PRESENT", label: "Present" },
            { value: "ABSENT", label: "Absent" }
          ]}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-[#0F172A]/80 border-b border-white/10 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              {loading ? (
                // Skeletons
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" /><div className="space-y-2"><div className="w-32 h-4 bg-white/5 animate-pulse rounded" /><div className="w-24 h-3 bg-white/5 animate-pulse rounded" /></div></div></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-white/5 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-6 bg-white/5 animate-pulse rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-6 bg-white/5 animate-pulse rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-8 bg-white/5 animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))
              ) : currentData.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="h-16 w-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4 transform -rotate-6">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">No participants found</h3>
                      <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                currentData.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                          {p.studentName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{p.studentName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300 font-medium">{p.eventTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusBadge[p.status?.toUpperCase()] || statusBadge.PENDING}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                        p.attendanceStatus?.toUpperCase() === "PRESENT"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : p.attendanceStatus?.toUpperCase() === "ABSENT"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      }`}>
                        {p.attendanceStatus || "PENDING"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status?.toUpperCase() === "PENDING" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={processingId === p.id}
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={processingId === p.id}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="bg-[#0F172A]/80 border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>
              Showing {filteredParticipants.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredParticipants.length)} of {filteredParticipants.length}
            </span>
            <div className="flex items-center gap-2">
              <span>Rows:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-transparent border-none text-white focus:ring-0 cursor-pointer text-sm font-medium"
              >
                {[10, 25, 50, 100].map(s => <option key={s} value={s} className="bg-[#1E293B]">{s}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white">
              Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading || totalPages === 0}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Participants;
