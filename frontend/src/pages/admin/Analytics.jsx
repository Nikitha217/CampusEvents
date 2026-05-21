import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import StatCard from "../../components/StatCard";

const Analytics = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <p className="text-muted-foreground mt-1">Platform insights and trends</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Monthly Active Users" value="3,421" icon={Users} variant="primary" />
      <StatCard title="Events This Month" value={32} icon={Calendar} trend="+15%" />
      <StatCard title="Avg. Attendance Rate" value="84%" icon={TrendingUp} variant="secondary" />
      <StatCard title="Total Registrations" value="12.4K" icon={BarChart3} />
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg p-5 shadow-card">
        <h3 className="font-display font-semibold mb-4">Events by Category</h3>
        <div className="space-y-3">
          {[
            { cat: "Technology", pct: 32 },
            { cat: "Cultural", pct: 24 },
            { cat: "Academic", pct: 20 },
            { cat: "Sports", pct: 15 },
            { cat: "Business", pct: 9 },
          ].map((item) => (
            <div key={item.cat}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.cat}</span>
                <span className="font-medium">{item.pct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 shadow-card">
        <h3 className="font-display font-semibold mb-4">Monthly Trends</h3>
        <div className="space-y-3">
          {[
            { month: "January", events: 18, users: 2800 },
            { month: "February", events: 24, users: 3100 },
            { month: "March", events: 32, users: 3421 },
          ].map((item) => (
            <div key={item.month} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="font-medium text-sm">{item.month}</span>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{item.events} events</span>
                <span>{item.users.toLocaleString()} users</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Analytics;
