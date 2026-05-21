import { Bell, Calendar, Check } from "lucide-react";
import { Button } from "../../components/ui/button";

const notifications = [
  { id: "1", title: "Registration Confirmed", message: "You're registered for Tech Innovation Summit 2026.", time: "2 hours ago", read: false },
  { id: "2", title: "Event Reminder", message: "Annual Cultural Fest starts in 3 days.", time: "5 hours ago", read: false },
  { id: "3", title: "Certificate Available", message: "Your certificate for Research Paper Presentation is ready.", time: "1 day ago", read: true },
  { id: "4", title: "New Event Published", message: "Startup Pitch Competition has been added. Check it out!", time: "2 days ago", read: true },
];

const Notifications = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">Stay updated with your events</p>
      </div>
      <Button variant="outline" size="sm"><Check className="h-4 w-4 mr-1" /> Mark all read</Button>
    </div>
    <div className="space-y-2">
      {notifications.map((n) => (
        <div key={n.id} className={`bg-card border rounded-lg p-4 flex gap-3 ${n.read ? "border-border" : "border-primary/30 bg-primary/5"}`}>
          <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${n.read ? "bg-muted" : "gradient-primary"}`}>
            {n.title.includes("Reminder") ? <Calendar className="h-4 w-4 text-primary-foreground" /> : <Bell className="h-4 w-4 text-primary-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Notifications;
