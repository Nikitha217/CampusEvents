import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, LayoutDashboard, Calendar, CalendarPlus, Users, ClipboardCheck, FileText, Search, Award, Bell, MessageSquare, User, BarChart3, Shield, FolderOpen, ScrollText, X } from "lucide-react";
import { cn } from "../lib/utils";

const menuByRole = {
  student: [
    { title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard },
    { title: "Browse Events", url: "/student/browse-events", icon: Search },
    { title: "My Registrations", url: "/student/registrations", icon: Calendar },
    { title: "Certificates", url: "/student/certificates", icon: Award },
    { title: "Notifications", url: "/student/notifications", icon: Bell },
    { title: "Profile", url: "/student/profile", icon: User },
  ],
  coordinator: [
    { title: "Dashboard", url: "/coordinator/dashboard", icon: LayoutDashboard },
    { title: "Create Event", url: "/coordinator/create-event", icon: CalendarPlus },
    { title: "Manage Events", url: "/coordinator/manage-events", icon: Calendar },
    { title: "Participants", url: "/coordinator/participants", icon: Users },
    { title: "Attendance", url: "/coordinator/attendance", icon: ClipboardCheck },
    { title: "Reports", url: "/coordinator/reports", icon: FileText },
  ],
  admin: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Manage Users", url: "/admin/manage-users", icon: Users },
    { title: "Approve Events", url: "/admin/approve-events", icon: Shield },
    { title: "Categories", url: "/admin/categories", icon: FolderOpen },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollText },
  ],
};

const AppSidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;
  const items = menuByRole[user.role];

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Go Back + Close */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            {user.role} Panel
          </span>
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = location.pathname === item.url;
            return (
              <button
                key={item.url}
                onClick={() => { navigate(item.url); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
