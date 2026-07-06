import { useState, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/use-toast";
import {
  Calendar,
  Award,
  ClipboardCheck,
  MapPin,
  X,
  ArrowRight,
  Users,
} from "lucide-react";
import StatCard from "../../components/StatCard";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    registeredEvents: 0,
    upcomingEvents: 0,
    certificates: 0,
  });

  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, eventsRes, regRes] = await Promise.all([
        API.get("/dashboard/student"),
        API.get("/events/approved"),
        user?.email
          ? API.get(`/registrations/student/${user.email}`)
          : Promise.resolve({ data: [] }),
      ]);

      setStats(statsRes.data || {});

      const normalizedEvents = (eventsRes.data || []).map((event) => ({
        ...event,
        id: event.id || event._id,
      }));

      setUpcomingEvents(normalizedEvents);

      const ids = new Set(
        (regRes.data || []).map((registration) =>
          String(registration.eventId)
        )
      );

      setRegisteredEventIds(ids);
    } catch (error) {
      console.error("Dashboard fetch error:", error);

      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = async (eventId) => {
    try {
      const response = await API.get(`/events/${eventId}`);

      setSelectedEvent({
        ...response.data,
        id: response.data.id || response.data._id,
      });
    } catch (error) {
      console.error("Failed to load event details", error);

      toast({
        title: "Error",
        description: "Unable to load event details",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (event) => {
    if (!user) {
      toast({
        title: "Please login first",
        variant: "destructive",
      });
      return;
    }

    if (registeredEventIds.has(String(event.id))) {
      toast({
        title: "Already Registered",
        description: "You are already registered for this event.",
      });
      return;
    }

    try {
      setRegisteringId(event.id);

      await API.post("/registrations", {
        studentName: user.name,
        studentEmail: user.email,
        eventId: event.id,
        eventTitle: event.title,
        status: "PENDING",
      });

      setRegisteredEventIds((prev) => {
        const updated = new Set(prev);
        updated.add(String(event.id));
        return updated;
      });

      setStats((prev) => ({
        ...prev,
        registeredEvents: (prev.registeredEvents || 0) + 1,
      }));

      toast({
        title: "Registration Successful 🎉",
        description: `You have registered for ${event.title}`,
      });
    } catch (error) {
      console.error("Registration Error:", error);

      const message =
        typeof error.response?.data === "string"
          ? error.response.data
          : "Registration failed. Please try again.";

      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-xl"></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-32 bg-white/5 rounded-2xl"
            ></div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-80 bg-white/5 rounded-2xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Student Dashboard
          </h1>

          <p className="text-slate-400 mt-1">
            Welcome back,{" "}
            <span className="text-purple-400 font-medium">
              {user?.name}
            </span>
          </p>
        </div>

        <div className="hidden md:flex h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-white font-bold text-lg">
            {user?.name?.charAt(0)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Registered Events"
          value={stats.registeredEvents || 0}
          icon={Calendar}
          variant="primary"
        />

        <StatCard
          title="Events Available"
          value={stats.totalEvents || 0}
          icon={ClipboardCheck}
        />

        <StatCard
          title="Certificates Earned"
          value={stats.certificates || 0}
          icon={Award}
        />
      </div>

      {/* Events Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Upcoming Events
          </h2>

          <span className="text-sm text-slate-400">
            {upcomingEvents.length} events available
          </span>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => {
            const isRegistered = registeredEventIds.has(
              String(event.id)
            );

            const isRegistering = registeringId === event.id;

            return (
              <div
                key={event.id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="relative h-52 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]" />

                  {event?.image && (() => {
                    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
                    let safeImage = "/placeholder-event.png";
                    if (event.image && typeof event.image === "string") {
                      safeImage = event.image.startsWith("/") ? `${API_BASE}${event.image}` : event.image;
                    }
                    return (
                      <img
                        src={safeImage}
                        alt={event.title}
                        className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { e.currentTarget.src = "/placeholder-event.png"; }}
                      />
                    );
                  })()}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />

                  {isRegistered && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500/30 border border-green-500/40 text-green-300 text-xs font-semibold backdrop-blur-md">
                      ✓ Registered
                    </div>
                  )}

                  {event.maxParticipants && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs text-slate-300">
                      <Users className="h-3 w-3" />
                      Capacity: {event.maxParticipants}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {event.title}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      {event.startDate || event.date || "TBA"}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-400" />
                      {event.location || "TBA"}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => handleViewEvent(event.id)}
                      className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      View Event
                    </button>

                    <button
                      onClick={() => handleRegister(event)}
                      disabled={isRegistered || isRegistering}
                      className={`flex-1 rounded-xl py-2.5 text-sm text-white font-medium transition-all duration-300 ${
                        isRegistered
                          ? "bg-green-600/50 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"
                      }`}
                    >
                      {isRegistering
                        ? "Registering..."
                        : isRegistered
                        ? "Registered ✓"
                        : "Register"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {upcomingEvents.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-600" />

            <p className="text-lg font-medium">
              No upcoming events
            </p>

            <p className="text-sm mt-1">
              Check back later for new events
            </p>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {selectedEvent?.image && (() => {
                const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
                let safeImage = "/placeholder-event.png";
                if (selectedEvent.image && typeof selectedEvent.image === "string") {
                  safeImage = selectedEvent.image.startsWith("/") ? `${API_BASE}${selectedEvent.image}` : selectedEvent.image;
                }
                return (
                  <img
                    src={safeImage}
                    alt={selectedEvent.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => { e.currentTarget.src = "/placeholder-event.png"; }}
                  />
                );
              })()}

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedEvent.title}
                </h2>

                <p className="text-slate-300 mt-3">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Category</p>
                  <p className="text-white">{selectedEvent.category}</p>
                </div>

                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="text-green-400">{selectedEvent.status}</p>
                </div>

                <div>
                  <p className="text-slate-500">Start Date</p>
                  <p className="text-white">{selectedEvent.startDate}</p>
                </div>

                <div>
                  <p className="text-slate-500">End Date</p>
                  <p className="text-white">{selectedEvent.endDate}</p>
                </div>

                <div>
                  <p className="text-slate-500">Start Time</p>
                  <p className="text-white">{selectedEvent.startTime}</p>
                </div>

                <div>
                  <p className="text-slate-500">End Time</p>
                  <p className="text-white">{selectedEvent.endTime}</p>
                </div>

                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="text-white">{selectedEvent.duration}</p>
                </div>

                <div>
                  <p className="text-slate-500">Capacity</p>
                  <p className="text-white">{selectedEvent.maxParticipants}</p>
                </div>

                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="text-white">{selectedEvent.location}</p>
                </div>

                <div>
                  <p className="text-slate-500">Coordinator</p>
                  <p className="text-white">
                    {selectedEvent.coordinatorName}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-slate-500">Coordinator Email</p>
                  <p className="text-white">
                    {selectedEvent.coordinatorEmail}
                  </p>
                </div>
              </div>

              {!registeredEventIds.has(String(selectedEvent.id)) && (
                <button
                  onClick={() => {
                    handleRegister(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="w-full rounded-2xl py-3 text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"
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

export default StudentDashboard;