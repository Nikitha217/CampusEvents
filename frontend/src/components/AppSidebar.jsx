import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Award,
  Users,
  Settings,
  LogOut,
  Bell,
  BarChart3,
  PlusCircle,
  UserCheck,
  FileText,
  MessageSquare,
  Tag,
  ShieldCheck,
  ScanLine,
  GraduationCap,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   NAVIGATION LINK DEFINITIONS
   Each role gets its own ordered list. Icons are Lucide components.
───────────────────────────────────────────────────────────────────────── */
const studentLinks = [
  { path: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/student/browse-events", label: "Browse Events", icon: Calendar },
  { path: "/student/my-registrations", label: "Registrations", icon: ClipboardList },
  { path: "/student/certificates", label: "Certificates", icon: Award },
  { path: "/student/notifications", label: "Notifications", icon: Bell },
  { path: "/student/profile", label: "Profile", icon: Settings },
];

const coordinatorLinks = [
  { path: "/coordinator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/coordinator/create-event", label: "Create Event", icon: PlusCircle },
  { path: "/coordinator/manage-events", label: "Manage Events", icon: Calendar },
  { path: "/coordinator/participants", label: "Participants", icon: Users },
  { path: "/coordinator/attendance", label: "Attendance", icon: UserCheck },
  { path: "/coordinator/issue-certificates", label: "Certificates", icon: Award },
  { path: "/coordinator/feedback", label: "Feedback", icon: MessageSquare },
  { path: "/coordinator/reports", label: "Reports", icon: BarChart3 },
  { path: "/coordinator/notifications", label: "Notifications", icon: Bell },
];

const adminLinks = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/users", label: "Manage Users", icon: Users },
  { path: "/admin/events", label: "Approve Events", icon: Calendar },
  { path: "/admin/categories", label: "Categories", icon: Tag },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin/certificates", label: "Certificates", icon: Award },
  { path: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
];



/* ─────────────────────────────────────────────────────────────────────────
   NAV ITEM — single navigation button
───────────────────────────────────────────────────────────────────────── */
const NavItem = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className={`
      relative w-full flex items-center gap-3
      px-4 min-h-[48px] py-2 rounded-xl text-sm font-medium
      transition-all duration-200 group overflow-hidden
      ${active
        ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
        : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
      }
    `}
  >
    {/* Glowing left-edge indicator on active item */}
    {active && (
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-fuchsia-300/90 shadow-[0_0_8px_2px_rgba(232,121,249,0.6)]"
      />
    )}

    {/* Icon */}
    <Icon
      className={`w-5 h-5 shrink-0 transition-colors duration-200 ${active ? "text-white" : "text-slate-500 group-hover:text-violet-400"
        }`}
    />

    {/* Label */}
    <span className="flex-1 truncate text-left">{label}</span>

    {/* Subtle hover shimmer layer (inactive items only) */}
    {!active && (
      <span
        aria-hidden="true"
        className="
          absolute inset-0 rounded-xl pointer-events-none
          opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-violet-600/[0.04] to-fuchsia-500/[0.02]
          transition-opacity duration-300
        "
      />
    )}
  </button>
);

/* ─────────────────────────────────────────────────────────────────────────
   APP SIDEBAR
   
   Layout strategy (fixes full-height issue):
   ─────────────────────────────────────────
   Desktop  → `hidden lg:flex flex-col h-full w-72`
              "h-full" fills the body row whose parent is `h-screen flex flex-col`.
              Body row has `flex-1 overflow-hidden` → computed height = viewport
              minus navbar. Sidebar fills that perfectly.

   Mobile   → `fixed inset-y-0 left-0 z-50 flex flex-col h-full w-72`
              Positioned from top=0 to bottom=0 of the viewport.
              Slides in/out with translate-x.
              Backdrop covers the rest of the screen.

   Props:
     open    — boolean, controls mobile drawer visibility
     onClose — callback to close the mobile drawer
───────────────────────────────────────────────────────────────────────── */
const AppSidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const role = user?.role || "student";
  const links =
    role === "coordinator" ? coordinatorLinks :
      role === "admin" ? adminLinks :
        studentLinks;



  /* Close mobile drawer on outside click */
  useEffect(() => {
    const onOutside = (e) => {
      if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open, onClose]);

  /* Close mobile drawer whenever the route changes */
  useEffect(() => {
    if (open) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ── Shared sidebar inner JSX ─────────────────────────────────────────── */
  const inner = (
    <>
      {/* ── Role-based panel header — 72px tall ──────────────────────── */}
      <div className="
        relative flex items-center justify-center h-[72px] shrink-0
        bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20
        border-b border-white/10
        overflow-hidden
      ">
        {/* Subtle radial glow in the center */}
        <div className="
          absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.12)_0%,transparent_70%)]
        " />

        {/* Panel label */}
        <div className="relative flex flex-col items-center gap-1.5">
          {/* Role icon */}
          {role === "admin" && (
            <ShieldCheck className="w-4 h-4 text-violet-400 opacity-80" />
          )}
          {role === "coordinator" && (
            <Calendar className="w-4 h-4 text-fuchsia-400 opacity-80" />
          )}
          {role === "student" && (
            <GraduationCap className="w-4 h-4 text-violet-300 opacity-80" />
          )}

          <p className="
            text-[11px] font-bold text-white/90
            tracking-[0.22em] uppercase leading-none
          ">
            {role === "admin" ? "Admin Panel"
              : role === "coordinator" ? "Coordinator Panel"
                : "Student Panel"}
          </p>
        </div>

        {/* Mobile close button — top-right corner */}
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="
            lg:hidden absolute right-3 top-1/2 -translate-y-1/2
            w-7 h-7 rounded-lg
            flex items-center justify-center
            text-slate-500 hover:text-white hover:bg-white/10
            transition-all duration-200
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation — scrolls independently ───────────────────────────── */}
      <nav
        className="
          flex-1 overflow-y-auto
          px-3 py-3 space-y-0.5
          [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <p className="
          px-4 mb-2 pt-1
          text-[10px] font-semibold text-slate-600
          uppercase tracking-[0.12em]
        ">
          Menu
        </p>

        {links.map(({ path, label, icon }) => (
          <NavItem
            key={path}
            label={label}
            icon={icon}
            active={location.pathname === path}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* ── Sign out — pinned at bottom ─────────────────────────────────── */}
      <div className="mt-auto p-4 border-t border-white/10">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="
            w-full flex items-center justify-center gap-2
            h-11 px-4 rounded-xl
            text-sm font-medium
            bg-red-500/10 text-red-400 border border-red-500/[0.15]
            hover:bg-red-500 hover:text-white hover:border-red-500
            transition-all duration-200
          "
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile backdrop ──────────────────────────────────────────────── */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/*
        ── DESKTOP sidebar ────────────────────────────────────────────────
        hidden on mobile (shown as drawer instead).
        h-full fills the body row height (= viewport - navbar).
        flex flex-col so children stack vertically.
        w-72 is fixed — main content gets the rest via flex-1.
      */}
      <aside
        className="
          hidden lg:flex flex-col
          h-full w-72 shrink-0
          bg-[#0F172A]
          border-r border-white/10
          shadow-[0_0_40px_rgba(124,58,237,0.15)]
        "
      >
        {inner}
      </aside>

      {/*
        ── MOBILE drawer sidebar ──────────────────────────────────────────
        fixed inset-y-0 left-0 = spans full viewport height.
        z-50 so it sits above the backdrop.
        translate-x controls open/closed.
        lg:hidden — hidden on desktop (desktop version above takes over).
      */}
      <aside
        ref={sidebarRef}
        className={`
          lg:hidden
          fixed inset-y-0 left-0 z-50
          flex flex-col w-72
          bg-[#0F172A]
          border-r border-white/10
          shadow-[0_0_40px_rgba(124,58,237,0.15)]
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {inner}
      </aside>
    </>
  );
};

export default AppSidebar;