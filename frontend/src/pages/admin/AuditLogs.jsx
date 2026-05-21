import { ScrollText, User, Calendar, Shield } from "lucide-react";

const logs = [
  { id: "1", action: "User Login", user: "Alex Johnson", role: "student", timestamp: "2026-03-07 14:23:00", ip: "192.168.1.45" },
  { id: "2", action: "Event Created", user: "Sarah Williams", role: "coordinator", timestamp: "2026-03-07 13:10:00", ip: "192.168.1.32" },
  { id: "3", action: "Event Approved", user: "Mike Chen", role: "admin", timestamp: "2026-03-07 12:45:00", ip: "192.168.1.10" },
  { id: "4", action: "User Registered", user: "Emma Davis", role: "student", timestamp: "2026-03-07 11:30:00", ip: "192.168.1.78" },
  { id: "5", action: "Role Updated", user: "Mike Chen", role: "admin", timestamp: "2026-03-07 10:15:00", ip: "192.168.1.10" },
  { id: "6", action: "Event Deleted", user: "Sarah Williams", role: "coordinator", timestamp: "2026-03-07 09:00:00", ip: "192.168.1.32" },
];

const iconMap = {
  "User Login": User,
  "Event Created": Calendar,
  "Event Approved": Shield,
  "User Registered": User,
  "Role Updated": Shield,
  "Event Deleted": Calendar,
};

const AuditLogs = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-2xl font-bold">Audit Logs</h1>
      <p className="text-muted-foreground mt-1">Track all system activities</p>
    </div>

    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Action</th>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Timestamp</th>
              <th className="text-left px-4 py-3 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const Icon = iconMap[log.action] || ScrollText;
              return (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />{log.action}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.user}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{log.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.timestamp}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AuditLogs;
