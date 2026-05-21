import { Bell, LogOut, Menu, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = ({ onToggleSidebar, showMenuButton = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-16 glass border-b border-border/60 flex items-center px-4 md:px-6">
      <div className="flex items-center gap-3 flex-1">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Eventora" className="h-8 w-8" />
          <span className="font-display font-bold text-lg text-primary hidden sm:block">Eventora</span>
        </button>
      </div>

      <nav className="flex items-center gap-2">
        {!isAuthenticated ? (
          <>
            <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/register")} className="gradient-primary text-primary-foreground">
              Sign Up
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate(`/${user?.role}/profile`)}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
