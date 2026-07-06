import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ClipboardCheck, Search, Users, CheckCircle2, XCircle, TrendingUp, Filter } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import eventService from "../../services/eventService";
import participantService from "../../services/participantService";
import attendanceService from "../../services/attendanceService";
import registrationService from "../../services/registrationService";

const Attendance = () => {
  const { toast } = useToast();
  
  // Data States
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [bulkMarking, setBulkMarking] = useState(false);
  
  // Filter States
  const [selectedEvent, setSelectedEvent] = useState("ALL");
  const [search, setSearch] = useState("");

  const hasFetched = useRef(false);

  // 1. Fetch Events and Participants on Mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Fetch events
        const eventsResponse = await eventService.getMyEvents();
        const eventsList = eventsResponse?.data || eventsResponse || [];
        setEvents(eventsList);
        
        if (eventsList.length > 0) {
          // Fetch all approved participants for these events
          const eventIds = eventsList.map(e => e.id).join(',');
          const participantsResponse = await participantService.exportParticipants({ eventIds, status: "APPROVED" });
          const participantsList = participantsResponse?.data || participantsResponse || [];
          setAttendees(participantsList);
        } else {
          setAttendees([]);
        }
      } catch (error) {
        console.error("Failed to load attendance data:", error);
        toast({ title: "Failed to load events", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [toast]);

  // Client-Side Filtering
  const filteredAttendees = useMemo(() => {
    return attendees.filter(p => {
      // Event filter
      if (selectedEvent !== "ALL" && p.eventId !== selectedEvent) return false;
      
      // Search text
      if (search) {
        const s = search.toLowerCase();
        const matchesName = p.studentName?.toLowerCase().includes(s);
        const matchesEmail = p.studentEmail?.toLowerCase().includes(s);
        const matchesEvent = p.eventTitle?.toLowerCase().includes(s);
        if (!matchesName && !matchesEmail && !matchesEvent) return false;
      }
      
      return true;
    });
  }, [attendees, selectedEvent, search]);

  // Client-Side Stats
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    filteredAttendees.forEach(p => {
      if (p.attendanceStatus === "PRESENT") present++;
      if (p.attendanceStatus === "ABSENT") absent++;
    });
    const total = filteredAttendees.length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, attendanceRate };
  }, [filteredAttendees]);

  // Toggle Single Attendance
  const toggleAttendance = useCallback(async (registration) => {
    const newStatus = registration.attendanceStatus === "PRESENT" ? "ABSENT" : "PRESENT";
    try {
      setMarking(registration.id);
      await registrationService.markAttendance(registration.id, newStatus);
      
      // Optimistic update
      setAttendees((prev) =>
        prev.map((item) =>
          item.id === registration.id ? { ...item, attendanceStatus: newStatus } : item
        )
      );
      toast({ title: `Marked as ${newStatus}` });
    } catch (error) {
      console.error("Toggle attendance failed:", error);
      toast({ title: "Failed to mark attendance", variant: "destructive" });
    } finally {
      setMarking(null);
    }
  }, [toast]);

  // Bulk Mark Attendance
  const markAll = useCallback(async (status) => {
    if (filteredAttendees.length === 0) return;
    
    const needsUpdate = filteredAttendees.filter(a => a.attendanceStatus !== status);
    if (needsUpdate.length === 0) return;

    try {
      setBulkMarking(true);
      const ids = filteredAttendees.map(a => a.id);
      await attendanceService.bulkMarkAttendance(ids, status);
      
      // Optimistic update
      setAttendees((prev) => prev.map((item) => {
        // If the item is in the filtered list, update its status
        if (ids.includes(item.id)) {
          return { ...item, attendanceStatus: status };
        }
        return item;
      }));
      toast({ title: `Marked ${ids.length} participants as ${status}` });
    } catch (error) {
      console.error("Bulk mark failed:", error);
      toast({ title: "Failed to bulk update attendance", variant: "destructive" });
    } finally {
      setBulkMarking(false);
    }
  }, [filteredAttendees, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-slate-400 animate-pulse">Loading events and attendance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-purple-400" />
          Attendance Management
        </h1>
        <p className="text-slate-400 mt-2">Mark and track participant attendance for your events.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 border border-emerald-500/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400/80 text-sm font-medium">Present</p>
              <h2 className="text-4xl font-bold text-emerald-400 mt-2">{stats.present}</h2>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-500/20 to-rose-900/10 border border-rose-500/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-400/80 text-sm font-medium">Absent</p>
              <h2 className="text-4xl font-bold text-rose-400 mt-2">{stats.absent}</h2>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-rose-500/20 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-rose-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-violet-500/20 to-violet-900/10 border border-violet-500/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-400/80 text-sm font-medium">Attendance Rate</p>
              <h2 className="text-4xl font-bold text-violet-400 mt-2">{stats.attendanceRate}%</h2>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-violet-400" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.attendanceRate}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-72">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm appearance-none bg-black/20 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id} className="bg-slate-900">
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search student or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => markAll("PRESENT")} 
            disabled={bulkMarking || filteredAttendees.length === 0}
            className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            Mark All Present
          </button>
          <button 
            onClick={() => markAll("ABSENT")} 
            disabled={bulkMarking || filteredAttendees.length === 0}
            className="flex-1 md:flex-none px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left">
            <thead className="bg-black/20">
              <tr>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Email</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-slate-500 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-1">No events available</h3>
                      <p className="text-slate-400 text-sm">Create an event to start tracking attendance.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-slate-500 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-1">No participants found</h3>
                      <p className="text-slate-400 text-sm">Try adjusting your search or select a different event.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((registration) => (
                  <tr key={registration.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                          {registration.studentName?.charAt(0) ?? "?"}
                        </div>
                        <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {registration.studentName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm">{registration.studentEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm">{registration.eventTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                        registration.attendanceStatus === "PRESENT"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : registration.attendanceStatus === "ABSENT"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}>
                        {registration.attendanceStatus === "PRESENT" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {registration.attendanceStatus === "ABSENT" && <XCircle className="w-3.5 h-3.5" />}
                        {registration.attendanceStatus === "PRESENT" ? "Present" : registration.attendanceStatus === "ABSENT" ? "Absent" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        disabled={marking === registration.id}
                        onClick={() => toggleAttendance(registration)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        {marking === registration.id ? "Saving..." : "Toggle"}
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
};

export default Attendance;
