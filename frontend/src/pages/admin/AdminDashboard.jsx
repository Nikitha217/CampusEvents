import StatCard from "../../components/StatCard";
import { Users, Calendar, Shield, BarChart3 } from "lucide-react";

const AdminDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-1">System overview and management</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" value="5,234" icon={Users} variant="primary" />
      <StatCard title="Total Events" value={156} icon={Calendar} trend="+8 this week" />
      <StatCard title="Pending Approvals" value={7} icon={Shield} variant="accent" />
      <StatCard title="Active Sessions" value={342} icon={BarChart3} />
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg p-5 shadow-card">
        <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: "New user registered", user: "Sekar", time: "2 min ago" },
            { action: "Event approved", user: "Admin", time: "15 min ago" },
            { action: "Event created", user: "Saravanan", time: "1 hour ago" },
            { action: "User role updated", user: "Admin", time: "3 hours ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-muted-foreground">by {item.user}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 shadow-card">
        <h3 className="font-display font-semibold mb-4">System Stats</h3>
        <div className="space-y-4">
          {[
            { label: "Students", value: 4200, max: 5000 },
            { label: "Coordinators", value: 85, max: 100 },
            { label: "Events This Month", value: 24, max: 50 },
            { label: "Server Uptime", value: 99, max: 100 },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{stat.label}</span>
                <span className="font-medium">{stat.value}/{stat.max}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${(stat.value / stat.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
