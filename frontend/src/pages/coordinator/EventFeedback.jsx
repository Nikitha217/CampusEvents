import { useEffect, useState } from "react";
import { MessageSquare, Star, ChevronDown } from "lucide-react";
import eventService from "../../services/eventService";
import API from "../../services/api";

/**
 * EventFeedback
 *
 * FIX 1: Replaced raw API.get with eventService.getMyEvents().
 * FIX 2: select element had plain border/bg with no dark styling — now matches UI.
 * FIX 3: Added empty-state icon and better loading state.
 */
const EventFeedback = () => {
  const [events, setEvents]         = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const data = await eventService.getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchFeedbacks = async (eventId) => {
    try {
      setLoading(true);
      const response = await API.get(`/feedback/event/${eventId}`);
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error("Failed to load feedback", error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (eventId) fetchFeedbacks(eventId);
    else setFeedbacks([]);
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="text-purple-400" /> Event Feedback
        </h1>
        <p className="text-slate-400 mt-1">View feedback submitted by students for your events</p>
      </div>

      {/* Event selector */}
      <div className="max-w-md">
        <label className="text-sm font-medium text-slate-300 mb-2 block">Select Event</label>
        <div className="relative">
          <select
            value={selectedEvent}
            onChange={handleEventChange}
            disabled={eventsLoading}
            className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3 pr-10 appearance-none focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
          >
            <option value="" className="bg-[#1E293B]">Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id} className="bg-[#1E293B]">{event.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Average rating badge */}
      {avgRating && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          Average Rating: {avgRating} / 5 ({feedbacks.length} reviews)
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          Loading feedback...
        </div>
      )}

      {/* Feedback cards */}
      {!loading && selectedEvent && (
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-14 text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500">No feedback submitted yet for this event.</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg shadow-purple-500/10 hover:border-purple-500/20 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white font-bold text-sm">
                      {feedback.studentName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feedback.studentName}</h3>
                      <p className="text-xs text-slate-500">
                        {feedback.submittedAt
                          ? new Date(feedback.submittedAt).toLocaleString("en-IN")
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star}
                        className={`h-4 w-4 ${star <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-sm">{feedback.comments}</p>

                {feedback.image && (() => {
                  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
                  let safeImage = "/placeholder-event.png";
                  if (feedback.image && typeof feedback.image === "string") {
                    safeImage = feedback.image.startsWith("/") ? `${API_BASE}${feedback.image}` : feedback.image;
                  }
                  return (
                    <img
                      src={safeImage}
                      alt="Feedback"
                      className="mt-4 w-full md:w-72 rounded-2xl border border-white/10"
                      onError={(e) => { e.currentTarget.src = "/placeholder-event.png"; }}
                    />
                  );
                })()}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EventFeedback;
