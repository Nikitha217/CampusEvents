import { Bell, LogOut, Menu, LayoutDashboard, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNotificationContext } from "../context/NotificationContext";

const Navbar = ({ onToggleSidebar, showMenuButton = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationContext();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="shrink-0 z-30 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/10 shadow-sm shadow-purple-500/5">
      <div className="h-16 px-4 md:px-8 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="lg:hidden rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group transition-all"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/40 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] border border-white/20 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                <img src={logo} alt="Eventora" className="h-6 w-6" />
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="font-black text-lg text-white leading-none tracking-tight">Eventora</h1>
              <p className="text-xs text-slate-400 mt-0.5">Campus Event Platform</p>
            </div>
          </button>
        </div>

        {/* CENTER */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          {isAuthenticated ? (
            <div className="px-5 py-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <p className="text-sm font-medium text-slate-300">
                Welcome back,{" "}
                <span className="text-[#A855F7] font-semibold">{user?.name}</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#statistics" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Statistics</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</a>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <nav className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </>
          ) : (
            <>
              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/${user?.role}/notifications`)}
                className="relative rounded-2xl hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold shadow-lg">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 shadow-sm rounded-2xl px-3 py-2 transition-all duration-300 group">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-md shadow-purple-500/30">
                      <span className="text-white font-bold uppercase text-sm">
                        {user?.name?.charAt(0)}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block group-hover:text-purple-400 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 rounded-2xl p-2 bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-purple-500/10"
                >
                  <div className="px-3 py-3">
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => navigate(`/${user?.role}/dashboard`)}
                    className="rounded-xl cursor-pointer hover:bg-purple-500/20 text-slate-200 hover:text-white transition-all"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4 text-purple-400" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl cursor-pointer hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
