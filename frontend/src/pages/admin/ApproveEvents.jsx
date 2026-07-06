import { useState, useEffect, useMemo } from "react";
import { 
  Check, X, Calendar, MapPin, Users, Search, Eye, 
  CheckCircle, XCircle, Filter, ArrowUpDown, Building, User, Clock, CheckSquare, XSquare, MessageSquare, AlertCircle
} from "lucide-react";
import API from "../../services/api";
import { useToast } from "../../hooks/use-toast";
import StatCard from "../../components/StatCard";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api","");

// Helper components
const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-200">
      {children}
    </div>
  </div>
);

const ApproveEvents = () => {
  const { toast } = useToast();
  
  // Data State
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setAL] = useState(null);
  
  // Filter & Sort State
  const [search, setSearch] = useState("");
  const [coordinatorSearch, setCoordinatorSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("PENDING"); // 'PENDING', 'APPROVED', 'REJECTED', 'ALL'
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'oldest'

  // Modal State
  const [eventDetailsModal, setEventDetailsModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [eventsRes, statsRes, categoriesRes] = await Promise.all([
          API.get("/events"), // Get all events for client-side filtering to avoid constant API calls
          API.get("/dashboard/admin/activity"),
          API.get("/categories")
        ]);
        
        setEvents(eventsRes.data || []);
        
        // Populate dashboard stats
        const adminStats = statsRes.data;
        setStats({
          totalEvents: adminStats.totalEvents || 0,
          pendingEvents: adminStats.pendingApprovals || 0,
          approvedEvents: adminStats.approvedEvents || 0,
          rejectedEvents: (adminStats.totalEvents || 0) - (adminStats.pendingApprovals || 0) - (adminStats.approvedEvents || 0) // Approximation if API doesn't provide exact rejected count
        });

        setCategories(categoriesRes.data || []);
      } catch (error) {
        toast({ title: "Failed to load dashboard data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Compute filtered and sorted events
  const processedEvents = useMemo(() => {
    let result = [...events];

    // Status Filter
    if (statusFilter !== "ALL") {
      result = result.filter(e => e.status?.toUpperCase() === statusFilter);
    }

    // Category Filter
    if (categoryFilter !== "all") {
      result = result.filter(e => e.category === categoryFilter);
    }

    // Title Search
    if (search) {
      result = result.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()));
    }

    // Coordinator Search
    if (coordinatorSearch) {
      result = result.filter(e => e.coordinatorName?.toLowerCase().includes(coordinatorSearch.toLowerCase()));
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.startDate || 0).getTime();
      const dateB = new Date(b.startDate || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [events, statusFilter, categoryFilter, search, coordinatorSearch, sortOrder]);

  // Actions
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this event?")) return;
    
    setAL(id + "_approve");
    try {
      await API.put(`/events/${id}/approve`);
      
      // Optimistic Update
      setEvents(prev => prev.map(e => e.id === id || e._id === id ? { ...e, status: "APPROVED" } : e));
      setStats(prev => ({
        ...prev,
        pendingEvents: Math.max(0, prev.pendingEvents - 1),
        approvedEvents: prev.approvedEvents + 1
      }));
      
      toast({ title: "✅ Event approved successfully!" });
    } catch {
      toast({ title: "Approval failed", variant: "destructive" });
    } finally {
      setAL(null);
    }
  };

  const submitReject = async () => {
    if (!rejectModal) return;
    if (!rejectionReason.trim()) {
      toast({ title: "Rejection reason is required", variant: "destructive" });
      return;
    }

    const id = rejectModal.id || rejectModal._id;
    setAL("reject_submit");
    try {
      await API.put(`/events/${id}/reject?reason=${encodeURIComponent(rejectionReason.trim())}`);
      
      // Optimistic Update
      setEvents(prev => prev.map(e => e.id === id || e._id === id ? { ...e, status: "REJECTED" } : e));
      setStats(prev => ({
        ...prev,
        pendingEvents: Math.max(0, prev.pendingEvents - 1),
        rejectedEvents: prev.rejectedEvents + 1
      }));
      
      toast({ title: "Event rejected" });
      setRejectModal(null);
      setRejectionReason("");
    } catch {
      toast({ title: "Rejection failed", variant: "destructive" });
    } finally {
      setAL(null);
    }
  };

  // Renders
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Event Approvals</h1>
        <p className="text-slate-400 mt-2">Manage, review, and moderate coordinator event submissions.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} variant="primary" />
        <StatCard title="Pending Approvals" value={stats.pendingEvents} icon={Clock} variant="accent" />
        <StatCard title="Approved Events" value={stats.approvedEvents} icon={CheckSquare} />
        <StatCard title="Rejected Events" value={stats.rejectedEvents} icon={XSquare} />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20 space-y-4">
        
        {/* Top Row: Search & Status Tabs */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          {/* Status Pills */}
          <div className="flex flex-wrap gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
            {[
              { id: "PENDING", label: "Pending" },
              { id: "APPROVED", label: "Approved" },
              { id: "REJECTED", label: "Rejected" },
              { id: "ALL", label: "All Events" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Title Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Bottom Row: Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          
          {/* Coordinator Search */}
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by coordinator name..."
              value={coordinatorSearch}
              onChange={e => setCoordinatorSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {categories.map(c => (
                <option key={c.id || c} value={c.name || c} className="bg-slate-900">{c.name || c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
            >
              <option value="newest" className="bg-slate-900">Sort: Newest First</option>
              <option value="oldest" className="bg-slate-900">Sort: Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-white/5 rounded-2xl border border-white/10 animate-pulse">
              <div className="h-32 bg-white/10 rounded-t-2xl mb-4" />
              <div className="px-5 space-y-3">
                <div className="h-5 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-10 bg-white/5 rounded mt-6" />
              </div>
            </div>
          ))}
        </div>
      ) : processedEvents.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-16 text-center shadow-lg shadow-black/20">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/10">
            <CheckCircle className="w-10 h-10 text-purple-400 opacity-80" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No events available</h3>
          <p className="text-slate-400">
            {statusFilter === "PENDING" ? "You're all caught up! No pending events require approval." : "No events matched your current filters."}
          </p>
          {(search || coordinatorSearch || categoryFilter !== "all") && (
            <button 
              onClick={() => { setSearch(""); setCoordinatorSearch(""); setCategoryFilter("all"); }}
              className="mt-6 px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors border border-white/5"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedEvents.map(event => {
            const id = event.id || event._id;
            const isPending = event.status === "PENDING";
            
            return (
              <div key={id} className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-lg shadow-black/20 hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                
                {/* Banner Section */}
                <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  {(event.posterUrl || event.image) && (() => {
                    let safeImage = "/placeholder-event.png";
                    const url = event.posterUrl || event.image;
                    if (url && typeof url === "string") {
                      safeImage = url.startsWith("/") ? `${BASE}${url}` : url;
                    }
                    return (
                      <img src={safeImage} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" onError={(e) => { e.currentTarget.src = "/placeholder-event.png"; }} />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm
                      ${event.status === "PENDING" ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : event.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-white/80 rounded-md text-[10px] uppercase font-semibold">
                      {event.category || "Uncategorized"}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">{event.title}</h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  
                  {/* Meta Details Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" /> <span className="truncate">{event.startDate || "TBA"}</span></div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> <span className="truncate">{event.location || "TBA"}</span></div>
                    <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="truncate">{event.coordinatorName || "Coordinator"}</span></div>
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-pink-400 shrink-0" /> <span>Max: {event.maxParticipants || "∞"}</span></div>
                  </div>

                  <p className="text-slate-300 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">{event.description}</p>

                  {/* Actions Base */}
                  <div className="mt-auto space-y-3">
                    <button 
                      onClick={() => setEventDetailsModal(event)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5"
                    >
                      <Eye className="w-4 h-4" /> View Full Details
                    </button>

                    {isPending && (
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => handleApprove(id)} 
                          disabled={actionLoading === id + "_approve"}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          {actionLoading === id+"_approve" ? "..." : "Approve"}
                        </button>
                        <button 
                          onClick={() => setRejectModal(event)} 
                          disabled={actionLoading === id + "_reject"}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold disabled:opacity-50 transition-all"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Reject Reason Modal --- */}
      {rejectModal && (
        <ModalOverlay onClose={() => setRejectModal(null)}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold text-white">Reject Event</h2>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              You are rejecting <strong className="text-white">"{rejectModal.title}"</strong>. Please provide a reason for the coordinator.
            </p>
            <div className="space-y-4">
              <textarea
                autoFocus
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[120px] resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => { setRejectModal(null); setRejectionReason(""); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitReject}
                  disabled={actionLoading === "reject_submit"}
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {actionLoading === "reject_submit" ? "Submitting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* --- Event Details Modal --- */}
      {eventDetailsModal && (
        <ModalOverlay onClose={() => setEventDetailsModal(null)}>
          <div className="max-h-[85vh] flex flex-col">
            {/* Modal Image Header */}
            <div className="relative h-48 shrink-0 bg-slate-800">
              {(eventDetailsModal.posterUrl || eventDetailsModal.image) ? (() => {
                let safeImage = "/placeholder-event.png";
                const url = eventDetailsModal.posterUrl || eventDetailsModal.image;
                if (url && typeof url === "string") {
                  safeImage = url.startsWith("/") ? `${BASE}${url}` : url;
                }
                return (
                  <img src={safeImage} alt="Poster" className="w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.src = "/placeholder-event.png"; }} />
                );
              })() : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <button 
                onClick={() => setEventDetailsModal(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className={`inline-block mb-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm
                      ${eventDetailsModal.status === "PENDING" ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : eventDetailsModal.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                      {eventDetailsModal.status}
                </span>
                <h2 className="text-2xl font-black text-white leading-tight">{eventDetailsModal.title}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{eventDetailsModal.description || "No description provided."}</p>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Schedule</h4>
                  <p className="text-slate-200 text-sm">{eventDetailsModal.startDate} {eventDetailsModal.startTime && `at ${eventDetailsModal.startTime}`}</p>
                  {eventDetailsModal.endDate && <p className="text-slate-400 text-xs">to {eventDetailsModal.endDate} {eventDetailsModal.endTime}</p>}
                </div>
                
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Venue</h4>
                  <p className="text-slate-200 text-sm">{eventDetailsModal.location || "TBA"}</p>
                  {eventDetailsModal.department && <p className="text-slate-400 text-xs">{eventDetailsModal.department}</p>}
                </div>
                
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Coordinator</h4>
                  <p className="text-slate-200 text-sm">{eventDetailsModal.coordinatorName}</p>
                  <p className="text-slate-400 text-xs truncate" title={eventDetailsModal.coordinatorEmail}>{eventDetailsModal.coordinatorEmail}</p>
                </div>
                
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Capacity</h4>
                  <p className="text-slate-200 text-sm">{eventDetailsModal.maxParticipants ? `${eventDetailsModal.maxParticipants} slots max` : "Unlimited"}</p>
                  <p className="text-slate-400 text-xs">{eventDetailsModal.category || "General"} Category</p>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer (If Pending) */}
            {eventDetailsModal.status === "PENDING" && (
              <div className="p-4 border-t border-white/10 bg-black/20 flex gap-3">
                <button 
                  onClick={() => {
                    setEventDetailsModal(null);
                    setRejectModal(eventDetailsModal);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold transition-all"
                >
                  Reject Event
                </button>
                <button 
                  onClick={() => {
                    handleApprove(eventDetailsModal.id || eventDetailsModal._id);
                    setEventDetailsModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Approve Event
                </button>
              </div>
            )}
          </div>
        </ModalOverlay>
      )}

    </div>
  );
};

export default ApproveEvents;
