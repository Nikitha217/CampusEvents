import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import logo from "../assets/logo.png";

const GOOGLE_CLIENT_ID =
  "798540745951-80dtnpnvea68kq22dqffjgocpliearib.apps.googleusercontent.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const googleInitialized = useRef(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleCredential = useCallback(
    (response) => {
      const idToken = response.credential;
      try {
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        sessionStorage.setItem("google_pending_credential", idToken);
        sessionStorage.setItem("google_pending_name", payload.name || "");
      } catch {
        sessionStorage.setItem("google_pending_credential", idToken);
      }
      navigate("/select-role");
    },
    [navigate]
  );

  useEffect(() => {
    if (window.google?.accounts?.id) { setGsiReady(true); return; }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { existing.onload = () => setGsiReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!gsiReady || !window.google?.accounts?.id || googleInitialized.current || window.__googleInitialized) return;
    googleInitialized.current = true;
    window.__googleInitialized = true;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [gsiReady, handleGoogleCredential]);

  useEffect(() => {
    return () => { if (window.google?.accounts?.id) window.google.accounts.id.cancel(); };
  }, []);

  const handleGoogleLogin = () => {
    if (!gsiReady) {
      toast({ title: "Google not ready", description: "Please wait a moment.", variant: "destructive" });
      return;
    }
    window.google.accounts.id.prompt();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await API.post("/auth/signin", { email, password }).then((r) => r.data);
      const role = data.roles?.[0]?.replace("ROLE_", "").toLowerCase() || "student";
      login({ id: data.id, name: data.name, email: data.email, role }, data.token);
      navigate(`/${role}/dashboard`);
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          typeof error.response?.data === "string"
            ? error.response.data
            : "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[280px] h-[280px] bg-indigo-700/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors text-sm mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">

          {/* Brand — logo stays as your imported image */}
          <div className="flex items-center gap-3 mb-7">
            <img src={logo} alt="Eventora logo" className="h-11 w-11 rounded-2xl" />
            <div>
              <p className="font-bold text-[17px] text-white tracking-tight">Eventora</p>
              <p className="text-xs text-slate-500">Campus Event Platform</p>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span className="text-[11px] font-medium text-purple-400 tracking-wide">Welcome back</span>
          </div>

          <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">Sign in to Eventora</h1>
          <p className="text-[13px] text-slate-500 mb-7">Your campus events are waiting for you.</p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] hover:border-white/20 text-slate-200 text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 mb-6"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[12px] text-slate-500">or sign in with email</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-400 tracking-wide">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full h-[46px] bg-white/[0.05] border border-white/[0.08] rounded-xl text-slate-200 text-sm pl-10 pr-4 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/[0.06] focus:ring-2 focus:ring-purple-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-slate-400 tracking-wide">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[12px] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[46px] bg-white/[0.05] border border-white/[0.08] rounded-xl text-slate-200 text-sm pl-10 pr-11 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/[0.06] focus:ring-2 focus:ring-purple-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-semibold text-[15px] flex items-center justify-center gap-2 mt-1 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="text-center text-[13px] text-slate-500 mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign up free
            </Link>
          </p>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 mt-5 pt-5 border-t border-white/[0.06]">
            {[
              { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Secured" },
              { icon: <Lock className="h-3.5 w-3.5" />, label: "Encrypted" },
              { icon: <EyeOff className="h-3.5 w-3.5" />, label: "Private" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="text-slate-600">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;