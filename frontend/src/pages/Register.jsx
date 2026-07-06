import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import {
  ArrowLeft, ArrowRight, User, Mail, Lock,
  Building2, UserCircle, ChevronDown, Eye, EyeOff, ShieldCheck, Phone,
} from "lucide-react";
import API from "../services/api";
import logo from "../assets/logo.png";

const GOOGLE_CLIENT_ID =
  "798540745951-80dtnpnvea68kq22dqffjgocpliearib.apps.googleusercontent.com";

const Register = () => {
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [department, setDepartment]     = useState("");
  const [college, setCollege]           = useState("");
  const [phone, setPhone]               = useState("");
  const [role, setRole]                 = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [gsiReady, setGsiReady]         = useState(false);
  const [errors, setErrors]             = useState({});
  const googleInitialized               = useRef(false);

  const navigate                  = useNavigate();
  const { toast }                 = useToast();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role)
      navigate(`/${user.role}/dashboard`, { replace: true });
  }, [isAuthenticated, user, navigate]);

  /* ── Google Sign-In ───────────────────────────────────────── */

  const handleGoogleCredential = useCallback((response) => {
    const idToken = response.credential;
    try {
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      sessionStorage.setItem("google_pending_credential", idToken);
      sessionStorage.setItem("google_pending_name", payload.name || "");
    } catch {
      sessionStorage.setItem("google_pending_credential", idToken);
    }
    navigate("/select-role");
  }, [navigate]);

  useEffect(() => {
    if (window.google?.accounts?.id) { setGsiReady(true); return; }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { existing.onload = () => setGsiReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true; script.defer = true;
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

  /* ── Validation ───────────────────────────────────────────── */

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.includes("@")) newErrors.email = "Valid email is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!department.trim()) newErrors.department = "Department is required";
    if (!college.trim()) newErrors.college = "College is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Form submit ──────────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({ title: "Please fix the errors below", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Send all fields including college and phone
      await API.post("/auth/send-otp", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department: department.trim(),
        college: college.trim(),
        phone: phone.trim(),
      });

      // Store in sessionStorage for OTP verification
      sessionStorage.setItem(
        "otp_pending",
        JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          department: department.trim(),
          college: college.trim(),
          phone: phone.trim(),
        })
      );

      toast({
        title: "OTP sent!",
        description: `Check ${email} for your 6-digit verification code.`,
      });

      navigate("/verify-otp");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send OTP. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared input className (matches Login exactly) ──────── */
  const inputCls =
    "w-full h-[46px] bg-white/[0.05] border border-white/[0.08] rounded-xl text-slate-200 text-sm pl-10 pr-4 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/[0.06] focus:ring-2 focus:ring-purple-500/10 transition-all";

  const inputClsError =
    "w-full h-[46px] bg-white/[0.05] border border-red-500/30 rounded-xl text-slate-200 text-sm pl-10 pr-4 placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:bg-red-500/[0.06] focus:ring-2 focus:ring-red-500/10 transition-all";

  const labelCls = "text-[12px] font-medium text-slate-400 tracking-wide";

  const errorCls = "text-red-400 text-xs mt-1";

  const roleOptions = [
    { value: "student", label: "Student", icon: "🎓" },
    { value: "coordinator", label: "Coordinator", icon: "📋" },
  ];

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 py-10 relative overflow-hidden">

      {/* Background orbs — same as Login */}
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[280px] h-[280px] bg-indigo-700/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[480px]">

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors text-sm mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

          {/* Brand */}
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
            <span className="text-[11px] font-medium text-purple-400 tracking-wide">Create your account</span>
          </div>

          <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">Sign up for Eventora</h1>
          <p className="text-[13px] text-slate-500 mb-7">We'll send a verification code to your email.</p>

          {/* Google button */}
          <button
            type="button"
            onClick={() => {
              if (window.google?.accounts?.id) {
                window.google.accounts.id.prompt();
              } else {
                toast({ title: "Google Sign-In not ready", description: "Please try again.", variant: "destructive" });
              }
            }}
            className="w-full h-12 rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] hover:border-white/20 text-slate-200 text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 mb-6"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[12px] text-slate-500">or sign up with email</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className={labelCls}>Full name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: "" })); }}
                  className={errors.name ? inputClsError : inputCls}
                />
              </div>
              {errors.name && <p className={errorCls}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className={labelCls}>Email address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: "" })); }}
                  className={errors.email ? inputClsError : inputCls}
                />
              </div>
              {errors.email && <p className={errorCls}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className={labelCls}>Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: "" })); }}
                  className={`${errors.password ? inputClsError : inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className={errorCls}>{errors.password}</p>}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className={labelCls}>Department *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE, IT, ECE"
                  value={department}
                  onChange={e => { setDepartment(e.target.value); if (errors.department) setErrors(prev => ({ ...prev, department: "" })); }}
                  className={errors.department ? inputClsError : inputCls}
                />
              </div>
              {errors.department && <p className={errorCls}>{errors.department}</p>}
            </div>

            {/* College */}
            <div className="space-y-1.5">
              <label className={labelCls}>College *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Your college name"
                  value={college}
                  onChange={e => { setCollege(e.target.value); if (errors.college) setErrors(prev => ({ ...prev, college: "" })); }}
                  className={errors.college ? inputClsError : inputCls}
                />
              </div>
              {errors.college && <p className={errorCls}>{errors.college}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className={labelCls}>Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                  }}
                  className={errors.phone ? inputClsError : inputCls}
                  maxLength="10"
                />
              </div>
              {errors.phone && <p className={errorCls}>{errors.phone}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className={labelCls}>I am a... *</label>
              <div className="relative">
                <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className={`${inputCls} pr-9 appearance-none cursor-pointer`}
                >
                  {roleOptions.map(o => (
                    <option key={o.value} value={o.value} className="bg-[#1E293B] text-slate-200">
                      {o.icon} {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-semibold text-[15px] flex items-center justify-center gap-2 mt-6 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending OTP...
                </>
              ) : (
                <>Send Verification Code <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-[13px] text-slate-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign in
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

export default Register;