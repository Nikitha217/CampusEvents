import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, ArrowRight, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import logo from "../../assets/logo.png";

const ROLES = [
  {
    id: "student",
    label: "Student",
    description: "Browse events, register, collect certificates, and track your campus journey.",
    icon: GraduationCap,
    gradient: "from-violet-600 to-purple-700",
    glow: "shadow-violet-500/40",
    ring: "ring-violet-500/60",
    badge: "Student",
    features: [
      "Browse & Register Events",
      "Download Certificates",
      "Track Attendance",
      "Get Notifications",
    ],
  },
  {
    id: "coordinator",
    label: "Coordinator",
    description: "Create events, manage participants, issue certificates, and view analytics.",
    icon: Users,
    gradient: "from-purple-600 to-fuchsia-700",
    glow: "shadow-purple-500/40",
    ring: "ring-purple-500/60",
    badge: "Coordinator",
    features: [
      "Create & Manage Events",
      "Issue Certificates",
      "View Analytics",
      "Manage Attendance",
    ],
  },
];

const SelectRole = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, user } = useAuth();

  const pendingCredential = sessionStorage.getItem("google_pending_credential");
  const pendingName = sessionStorage.getItem("google_pending_name");

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`, { replace: true });
      return;
    }
    if (!pendingCredential) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, pendingCredential, navigate]);

  const handleConfirm = async () => {
    if (!selectedRole) {
      toast({
        title: "Select a role",
        description: "Choose Student or Coordinator to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await authService.googleLogin(pendingCredential, selectedRole);

      sessionStorage.removeItem("google_pending_credential");
      sessionStorage.removeItem("google_pending_name");

      const role = selectedRole.toLowerCase().trim();

      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: role,
      };

      login(userData, data.token);

      toast({
        title: "Welcome to Eventora! 🎉",
        description: `Signed in as ${data.name}`,
      });

      navigate(`/${role}/dashboard`, { replace: true });

    } catch (error) {
      const msg =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.message || "Please try again.";

      toast({
        title: "Authentication Failed",
        description: msg,
        variant: "destructive",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden px-4 py-10">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors text-sm mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-900/30 mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/40 rounded-2xl blur-md" />
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] border border-white/20 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <img src={logo} alt="logo" className="h-8 w-8" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="font-black text-xl text-white tracking-tight">Eventora</h1>
              <p className="text-xs text-slate-400">Campus Event Platform</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-purple-300" />
            <span className="text-xs font-medium text-purple-200">Almost there!</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {pendingName ? `Welcome, ${pendingName.split(" ")[0]}!` : "Choose Your Role"}
          </h2>
          <p className="text-slate-400 text-sm">
            Select how you'll use Eventora. This determines your dashboard and permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {ROLES.map((roleOption) => {
            const Icon = roleOption.icon;
            const isSelected = selectedRole === roleOption.id;
            const isHovered = hoveredRole === roleOption.id;

            return (
              <button
                key={roleOption.id}
                onClick={() => setSelectedRole(roleOption.id)}
                onMouseEnter={() => setHoveredRole(roleOption.id)}
                onMouseLeave={() => setHoveredRole(null)}
                className={`
                  relative text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer group
                  ${
                    isSelected
                      ? `bg-white/10 border-purple-500/60 ring-2 ${roleOption.ring} shadow-xl ${roleOption.glow}`
                      : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${roleOption.gradient} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 ${
                    isSelected || isHovered ? "scale-110" : "scale-100"
                  }`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 bg-gradient-to-r ${roleOption.gradient} text-white`}
                >
                  {roleOption.badge}
                </span>

                <h3 className="text-lg font-bold text-white mb-2">{roleOption.label}</h3>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{roleOption.description}</p>

                <ul className="space-y-1.5">
                  {roleOption.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-400 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${roleOption.gradient} shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl px-4 py-3 mb-6">
          <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
          <p className="text-xs text-slate-400">
            Your role is verified and stored securely on our servers. Admin roles cannot be self-assigned.
          </p>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedRole || loading}
          className={`
            w-full h-14 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3
            ${
              selectedRole
                ? "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01]"
                : "bg-white/10 cursor-not-allowed opacity-50"
            }
          `}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up your account...
            </>
          ) : (
            <>
              Continue as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : "..."}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Changed your mind?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Go back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SelectRole;