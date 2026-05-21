import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "./ui/button";

const statusColors = {
  upcoming: "bg-secondary/10 text-secondary",
  ongoing: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  pending: "bg-accent/10 text-accent",
};

const EventCard = ({ event, onRegister, onView, showActions = true }) => (
  <div className="bg-card rounded-lg border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
    <div className="h-40 gradient-primary relative overflow-hidden">
      {event.image && (
        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      )}
      <div className="absolute top-3 right-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[event.status || "upcoming"]}`}>
          {event.status || "upcoming"}
        </span>
      </div>
      <div className="absolute top-3 left-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card/90 text-foreground">
          {event.category}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-display font-semibold text-base mb-2 line-clamp-1">{event.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>{event.date} • {event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>{event.participants}/{event.maxParticipants} registered</span>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onView?.(event.id)}>
            View Details
          </Button>
          <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => onRegister?.(event.id)}>
            Register
          </Button>
        </div>
      )}
    </div>
  </div>
);

export default EventCard;
