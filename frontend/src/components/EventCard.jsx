import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const statusColors = {
  upcoming: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  ongoing: "bg-green-500/20 text-green-300 border border-green-500/30",
  completed: "bg-white/10 text-slate-400 border border-white/10",
  pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
};

const EventCard = ({ event, onRegister, onView, showActions = true }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
    <div className="h-44 relative overflow-hidden">
      {/* Gradient fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]" />
      {event.image && (() => {
        const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
        let safeImage = "/placeholder-event.png";
        if (event.image && typeof event.image === "string") {
          safeImage = event.image.startsWith("/") ? `${API_BASE}${event.image}` : event.image;
        }
        return (
          <img
            src={safeImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-event.png";
            }}
          />
        );
      })()}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />

      <div className="absolute top-3 right-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${statusColors[event.status || "upcoming"]}`}>
          {event.status || "upcoming"}
        </span>
      </div>
      <div className="absolute top-3 left-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
          {event.category}
        </span>
      </div>
    </div>

    <div className="p-5">
      <h3 className="font-bold text-base text-white mb-1.5 line-clamp-1">{event.title}</h3>
      <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>

      <div className="space-y-2 text-xs text-slate-400 mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
          <span>{event.date} • {event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
          <span>{event.participants}/{event.maxParticipants} registered</span>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/25 rounded-xl transition-all"
            onClick={() => onView?.(event.id)}
          >
            View
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 border-0"
            onClick={() => onRegister?.(event.id)}
          >
            Register
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  </div>
);

export default EventCard;
