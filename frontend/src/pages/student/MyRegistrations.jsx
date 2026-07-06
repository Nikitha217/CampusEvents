import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Search, QrCode, CheckCircle2, Eye, MessageSquare, X, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import registrationService from "../../services/registrationService";
import { useToast } from "../../hooks/use-toast";
import API from "../../services/api";

const MyRegistrations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const participantName = user?.name || "Participant";

  const [registrations, setRegistrations]               = useState([]);
  const [search, setSearch]                             = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen]       = useState(false);
  const [selectedFeedbackEvent, setSelectedFeedbackEvent] = useState(null);
  const [feedbackData, setFeedbackData]                 = useState({ rating: 5, comments: "", imageFile: null });
  const [loading, setLoading]                           = useState(true);
  const [cancellingId, setCancellingId]                 = useState(null);
  const [submittingFeedback, setSubmittingFeedback]     = useState(false);

  useEffect(() => {
    if (user?.email) fetchRegistrations();
    else setLoading(false);
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await registrationService.getStudentRegistrations(user.email);
      const formatted = (data || []).map((reg, index) => ({
        id:               reg.id || index,
        registrationId:   reg.id,
        eventId:          reg.eventId,
        title:            reg.eventTitle || "Event",
        status:           reg.status?.toLowerCase() || "pending",
        attendanceStatus: reg.attendanceStatus?.toUpperCase() || "PENDING",
        attended:         reg.attended || reg.attendanceStatus?.toUpperCase() === "PRESENT" || false,
        certificateIssued:reg.certificateIssued || false,
        qr:               `QR-${reg.eventId}`,
        date:             "See Event Details",
        time:             "TBA",
        location:         "Campus",
        category:         "General",
      }));
      setRegistrations(formatted);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to load registrations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reg) => {
    if (!window.confirm(`Cancel registration for "${reg.title}"?`)) return;
    setCancellingId(reg.id);
    try {
      await registrationService.cancelRegistration(reg.registrationId);
      setRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      toast({ title: "Registration cancelled", description: `Your registration for ${reg.title} was cancelled.` });
    } catch (error) {
      const msg = typeof error.response?.data === "string" ? error.response.data : "Failed to cancel registration";
      toast({ title: "Cancel Failed", description: msg, variant: "destructive" });
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewTicket = (reg) => {
    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write(`
      <html><head><title>${reg.title} Ticket</title>
      <style>body{font-family:Arial;background:#0F172A;padding:30px}.ticket{max-width:700px;margin:auto;background:#1E293B;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}.header{background:linear-gradient(to right,#7C3AED,#A855F7);color:white;padding:30px;text-align:center}.content{padding:30px;color:#CBD5E1}.row{margin-bottom:15px;font-size:16px}.label{font-weight:bold;color:#A78BFA}.qr{margin-top:20px;padding:15px;border-radius:16px;background:rgba(124,58,237,.15);text-align:center;font-weight:bold;color:#C4B5FD;border:1px solid rgba(124,58,237,.3)}</style>
      </head><body><div class="ticket"><div class="header"><h1>${reg.title}</h1><p>Entry Ticket – ${reg.status.toUpperCase()}</p></div>
      <div class="content"><div class="row"><span class="label">Participant:</span> ${participantName}</div>
      <div class="row"><span class="label">Attendance:</span> ${reg.attendanceStatus}</div>
      <div class="row"><span class="label">Certificate Issued:</span> ${reg.certificateIssued ? "Yes" : "No"}</div>
      <div class="qr">QR: ${reg.qr}</div></div></div></body></html>`);
    w.document.close();
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      let imageUrl = "";
      if (feedbackData.imageFile) {
        const formData = new FormData();
        formData.append("file", feedbackData.imageFile);
        const uploadRes = await API.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        imageUrl = uploadRes.data?.url || uploadRes.data || "";
      }
      await API.post("/feedback", {
        eventId:     selectedFeedbackEvent.eventId,
        studentId:   String(user.id),
        studentName: participantName,
        rating:      feedbackData.rating,
        comments:    feedbackData.comments,
        image:       imageUrl,
      });
      setFeedbackModalOpen(false);
      setFeedbackData({ rating: 5, comments: "", imageFile: null });
      toast({ title: "Feedback submitted! 🎉" });
    } catch (error) {
      const msg = typeof error.response?.data === "string" ? error.response.data : "Failed to submit feedback";
      toast({ title: "Feedback Failed", description: msg, variant: "destructive" });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filtered = registrations.filter((reg) =>
    reg.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = {
    approved:   "bg-purple-500/20 border border-purple-500/40 text-purple-300",
    pending:    "bg-yellow-500/20 border border-yellow-500/40 text-yellow-300",
    rejected:   "bg-red-500/20 border border-red-500/40 text-red-300",
    registered: "bg-purple-500/20 border border-purple-500/40 text-purple-300",
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Registrations</h1>
        <p className="text-slate-400 mt-1">Track and manage your registered events</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search registrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Registered Events</h2>
        <span className="text-sm text-slate-400">{filtered.length} registrations</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length > 0 ? filtered.map((reg) => (
          <div key={reg.id} className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{reg.title}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{reg.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize backdrop-blur-md ${statusStyle[reg.status] || statusStyle.pending}`}>
                    {reg.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reg.attended ? "bg-green-500/20 border border-green-500/40 text-green-300" : "bg-orange-500/20 border border-orange-500/40 text-orange-300"}`}>
                    {reg.attended ? "✓ Present" : "Not Attended"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-slate-400">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-purple-400 flex-shrink-0" />{reg.date}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-purple-400 flex-shrink-0" />{reg.time}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-purple-400 flex-shrink-0" />{reg.location}</div>
                <div className="flex items-center gap-2"><QrCode className="h-4 w-4 text-purple-400 flex-shrink-0" />{reg.qr}</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                  Attendance: <span className="font-semibold text-slate-300">{reg.attendanceStatus}</span>
                </div>
                {reg.certificateIssued && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    Certificate Issued ✓
                  </div>
                )}
              </div>

              <div className="border-t border-white/10" />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleViewTicket(reg)}
                  className="flex items-center justify-center gap-2 border border-white/15 rounded-xl py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all"
                >
                  <Eye className="h-4 w-4" /> View Ticket
                </button>
                <button
                  disabled={!reg.attended}
                  onClick={() => { setSelectedFeedbackEvent(reg); setFeedbackModalOpen(true); }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${reg.attended ? "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white hover:shadow-lg hover:shadow-purple-500/40" : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  {reg.attended ? "Feedback" : "Attend First"}
                </button>
              </div>

              {/* Cancel button */}
              {reg.status !== "rejected" && (
                <button
                  onClick={() => handleCancel(reg)}
                  disabled={cancellingId === reg.id}
                  className="w-full flex items-center justify-center gap-2 border border-red-500/20 rounded-xl py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {cancellingId === reg.id ? "Cancelling..." : "Cancel Registration"}
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 col-span-full text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-lg font-medium">No registrations found</p>
            <p className="text-sm mt-1">Register for events to see them here</p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModalOpen && selectedFeedbackEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 w-full max-w-md animate-fade-in">
            <div className="p-6 space-y-5 relative">
              <button onClick={() => setFeedbackModalOpen(false)} className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 p-2 rounded-full text-slate-400 hover:text-white transition-all">
                <X className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">Leave Feedback</h2>
                <p className="text-sm text-slate-400 mt-1">Event: <span className="text-purple-400 font-medium">{selectedFeedbackEvent.title}</span></p>
              </div>
              <div className="border-t border-white/10" />
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Rating (1–5)</label>
                  <input
                    type="number" min="1" max="5"
                    value={feedbackData.rating}
                    onChange={(e) => setFeedbackData({ ...feedbackData, rating: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Comments</label>
                  <textarea
                    rows="4" value={feedbackData.comments}
                    onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                    placeholder="Share your experience..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Upload Photo (Optional)</label>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setFeedbackData({ ...feedbackData, imageFile: e.target.files[0] })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-500/20 file:text-purple-300 file:text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit" disabled={submittingFeedback}
                  className="w-full rounded-2xl py-3.5 text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submittingFeedback ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : "Submit Feedback"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;