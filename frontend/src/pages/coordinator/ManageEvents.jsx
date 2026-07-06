import { useState, useEffect } from "react";

import {
  Edit,
  Trash2,
  Search,
  Eye,
  Calendar,
  MapPin,
  Users,
  X,
  Save,
  Clock,
  PlayCircle,
  CheckSquare,
} from "lucide-react";

import API from "../../services/api";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// FIX: Use env variable instead of hardcoded localhost
const getImageSrc = (image) => {
  if (!image || typeof image !== "string") return "/placeholder-event.png";
  if (image.startsWith("/")) {
    const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
    return `${base}${image}`;
  }
  return image;
};

const statusColor = {
  PENDING:   "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  APPROVED:  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ACTIVE:    "bg-green-500/20 text-green-300 border-green-500/30",
  COMPLETED: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  REJECTED:  "bg-red-500/20 text-red-300 border-red-500/30",
};

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // track which event is loading

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/my-events");
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      setActionLoading(id);
      await API.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id && e._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete event.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async () => {
    if (!editingEvent.title?.trim()) {
      alert("Title is required.");
      return;
    }
    if (!editingEvent.location?.trim()) {
      alert("Location is required.");
      return;
    }
    try {
      await API.put(`/events/${editingEvent.id || editingEvent._id}`, editingEvent);
      fetchEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update event.");
    }
  };

  // FIX: Activate event — PUT /events/{id}/activate (was missing from UI)
  const handleActivate = async (id) => {
    try {
      setActionLoading(id);
      await API.put(`/events/${id}/activate`);
      fetchEvents();
    } catch (error) {
      console.error("Activate failed:", error);
      alert(error?.response?.data || "Failed to activate event.");
    } finally {
      setActionLoading(null);
    }
  };

  // FIX: Complete event — PUT /events/{id}/complete (was missing from UI)
  const handleComplete = async (id) => {
    if (!window.confirm("Mark this event as completed?")) return;
    try {
      setActionLoading(id);
      await API.put(`/events/${id}/complete`);
      fetchEvents();
    } catch (error) {
      console.error("Complete failed:", error);
      alert(error?.response?.data || "Failed to complete event.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <p className="text-slate-500 mt-1">Edit and manage your created events</p>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* EVENT CARDS */}
      <div className="grid lg:grid-cols-2 gap-5">
        {filteredEvents.map((event) => (
          <div
            key={event.id || event._id}
            className="bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10 hover:shadow-xl transition"
          >
            {/* IMAGE */}
            <div className="w-full h-48 overflow-hidden">
              <img
                src={getImageSrc(event.image)}
                alt={event.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                onError={(e) => { e.target.src = "/placeholder-event.png"; }}
              />
            </div>

            {/* CONTENT */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{event.title}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[event.status] || statusColor.PENDING}`}>
                  {event.status || "PENDING"}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  {event.startDate}{event.endDate && event.endDate !== event.startDate ? ` → ${event.endDate}` : ""}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  {event.startTime} {event.endTime ? `- ${event.endTime}` : ""}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Max: {event.maxParticipants || 0}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                </Button>

                <Button variant="secondary" size="sm" onClick={() => setEditingEvent({ ...event })}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>

                {/* FIX: Show Activate button only for APPROVED events */}
                {event.status === "APPROVED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                    disabled={actionLoading === (event.id || event._id)}
                    onClick={() => handleActivate(event.id || event._id)}
                  >
                    <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Activate
                  </Button>
                )}

                {/* FIX: Show Complete button for ACTIVE and APPROVED events */}
                {(event.status === "ACTIVE" || event.status === "APPROVED") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                    disabled={actionLoading === (event.id || event._id)}
                    onClick={() => handleComplete(event.id || event._id)}
                  >
                    <CheckSquare className="h-3.5 w-3.5 mr-1.5" /> Complete
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={actionLoading === (event.id || event._id)}
                  onClick={() => deleteEvent(event.id || event._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-14 border rounded-2xl bg-white/5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold">No Events Found</h3>
          <p className="text-muted-foreground mt-1">Try searching another event</p>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-white/10 rounded-lg transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <img src={getImageSrc(selectedEvent.image)} alt={selectedEvent.title} className="w-full h-64 object-cover rounded-xl" onError={(e) => { e.target.src = "/placeholder-event.png"; }} />
            <p className="text-slate-400 text-sm">{selectedEvent.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Start Date", selectedEvent.startDate],
                ["End Date", selectedEvent.endDate],
                ["Start Time", selectedEvent.startTime],
                ["End Time", selectedEvent.endTime],
                ["Location", selectedEvent.location],
                ["Duration", selectedEvent.duration],
                ["Category", selectedEvent.category],
                ["Max Participants", selectedEvent.maxParticipants],
              ].map(([label, value]) => (
                <div key={label} className="border border-white/10 rounded-xl p-4">
                  <p className="text-slate-500 mb-1">{label}</p>
                  <p className="font-semibold">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Event</h2>
              <button onClick={() => setEditingEvent(null)} className="p-1 hover:bg-white/10 rounded-lg transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Title *</label>
                <Input value={editingEvent.title || ""} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea
                  value={editingEvent.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Start Date</label>
                  <Input type="date" value={editingEvent.startDate || ""} onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">End Date</label>
                  <Input type="date" value={editingEvent.endDate || ""} onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Start Time</label>
                  <Input type="time" value={editingEvent.startTime || ""} onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">End Time</label>
                  <Input type="time" value={editingEvent.endTime || ""} onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Location *</label>
                <Input value={editingEvent.location || ""} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Max Participants</label>
                <Input type="number" min="1" value={editingEvent.maxParticipants || ""} onChange={(e) => setEditingEvent({ ...editingEvent, maxParticipants: Number(e.target.value) })} />
              </div>
            </div>

            <Button className="w-full mt-2" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
