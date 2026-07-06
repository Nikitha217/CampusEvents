import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Users, Building2, X, Mail } from "lucide-react";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import { useAuth } from "../../context/AuthContext";

const fallbackImage = "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop";

const BrowseEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const approvedEvents = await eventService.getApprovedEvents();
        setEvents(approvedEvents);

        if (user && user.email) {
          const registrations = await registrationService.getStudentRegistrations(user.email);
          const ids = new Set(registrations.map((r) => r.eventId));
          setRegisteredEventIds(ids);
        }
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const handleRegister = async (event) => {
    if (!user) {
      alert("Please login to register for events.");
      return;
    }

    if (registeredEventIds.has(event.id)) {
      setSuccessMessage("You are already registered for this event!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      const registrationData = {
        studentName: user.name,
        studentEmail: user.email,
        eventId: event.id.toString(),
        eventTitle: event.title,
        status: "PENDING",
      };

      await registrationService.registerForEvent(registrationData);
      setRegisteredEventIds((prev) => new Set(prev).add(event.id));
      setSuccessMessage(`Successfully registered for ${event.title}!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Registration failed", error);
      alert("Failed to register for the event. It might already be full or you are already registered.");
    }
  };

  const categories = [
    "All",
    ...new Set(events.map((e) => e.category).filter(Boolean)),
  ];

  const departments = [
    "All",
    ...new Set(events.map((e) => e.department).filter(Boolean)),
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ? true : event.category === selectedCategory;
    const matchesDepartment =
      selectedDepartment === "All" ? true : event.department === selectedDepartment;
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400 text-lg animate-pulse">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">Browse Events</h1>
        <p className="text-slate-400 mt-1">Explore and register for upcoming events</p>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-slate-300 focus:outline-none focus:border-purple-500/50 transition-all"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-[#1E293B] text-white">
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        {/* Department */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-slate-300 focus:outline-none focus:border-purple-500/50 transition-all"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept} className="bg-[#1E293B] text-white">
              {dept === "All" ? "All Departments" : dept}
            </option>
          ))}
        </select>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-green-500/15 border border-green-500/30 text-green-300 px-5 py-4 rounded-2xl backdrop-blur-md animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
        <span className="text-sm text-slate-400">{filteredEvents.length} events available</span>
      </div>

      {/* EVENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const isRegistered = registeredEventIds.has(event.id);
          const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
          const safeImageUrl = event.image && typeof event.image === "string" ? (event.image.startsWith("/") ? `${API_BASE}${event.image}` : event.image) : fallbackImage;
          const imageUrl = safeImageUrl;

          return (
            <div
              key={event.id}
              className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]" />
                <img
                  src={imageUrl}
                  alt={event.title}
                  className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.src = fallbackImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />

                {isRegistered && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500/30 border border-green-500/40 text-green-300 text-xs font-semibold backdrop-blur-md">
                    ✓ Registered
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold backdrop-blur-md">
                  {event.status}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  
                  {/* BADGES - New Enhancement */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                      {event.category || "Event"}
                    </span>

                    {event.department && (
                      <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs">
                        {event.department}
                      </span>
                    )}

                    <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">
                      {event.duration || "TBA"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mt-3 line-clamp-2">{event.description}</p>
                </div>

                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    {event.startDate} {event.startTime ? `- ${event.startTime}` : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    {event.location || "TBA"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    {event.coordinatorName || "Coordinator"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    Capacity: {event.maxParticipants || "Unlimited"}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-200"
                  >
                    View Event
                  </button>
                  <button
                    onClick={() => handleRegister(event)}
                    disabled={isRegistered}
                    className={`flex-1 rounded-xl py-2.5 text-sm text-white font-medium transition-all duration-300 ${
                      isRegistered
                        ? "bg-green-600/50 cursor-not-allowed border border-green-500/30"
                        : "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:shadow-lg hover:shadow-purple-500/40 hover:scale-[1.02]"
                    }`}
                  >
                    {isRegistered ? "Registered ✓" : "Register"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-600" />
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 w-full max-w-2xl animate-fade-in my-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]" />
              {(() => {
                const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
                const safeImageUrl = selectedEvent.image && typeof selectedEvent.image === "string" ? (selectedEvent.image.startsWith("/") ? `${API_BASE}${selectedEvent.image}` : selectedEvent.image) : fallbackImage;
                return (
                  <img
                    src={safeImageUrl}
                    alt={selectedEvent.title}
                    className="relative w-full h-64 object-cover"
                    onError={(e) => { e.currentTarget.src = fallbackImage; }}
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/60 to-transparent" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/60 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ENHANCED MODAL CONTENT */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedEvent.title}
                </h2>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Category</p>
                    <p className="text-white font-medium">
                      {selectedEvent.category || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Department</p>
                    <p className="text-white font-medium">
                      {selectedEvent.department || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Status</p>
                    <p className="text-green-400 font-medium">
                      {selectedEvent.status}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Duration</p>
                    <p className="text-white font-medium">
                      {selectedEvent.duration || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Start Date</p>
                    <p className="text-white font-medium">
                      {selectedEvent.startDate || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">End Date</p>
                    <p className="text-white font-medium">
                      {selectedEvent.endDate || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Start Time</p>
                    <p className="text-white font-medium">
                      {selectedEvent.startTime || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">End Time</p>
                    <p className="text-white font-medium">
                      {selectedEvent.endTime || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Venue</p>
                    <p className="text-white font-medium">
                      {selectedEvent.location || "TBA"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Coordinator</p>
                    <p className="text-white font-medium">
                      {selectedEvent.coordinatorName || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Coordinator Email</p>
                    <p className="text-white font-medium break-all text-xs flex items-center gap-2">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      {selectedEvent.coordinatorEmail || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500">Max Participants</p>
                    <p className="text-white font-medium">
                      {selectedEvent.maxParticipants || "Unlimited"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Description
                </h3>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-slate-300 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              {!registeredEventIds.has(selectedEvent.id) && (
                <button
                  onClick={() => {
                    handleRegister(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="w-full rounded-2xl py-3.5 text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] transition-all duration-300"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseEvents;