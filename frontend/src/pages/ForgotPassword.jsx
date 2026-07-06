import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import logo from "../assets/logo.png";
import API from "../services/api";

const ForgotPassword = () => {
  const [step, setStep]             = useState("email"); // "email" | "reset"
  const [email, setEmail]           = useState("");
  const [token, setToken]           = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [sent, setSent]             = useState(false);
  const { toast } = useToast();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
      toast({ title: "Reset link sent 📩", description: "Check your email or notifications for your reset token." });
    } catch (err) {
      toast({ title: "Request Failed", description: "Could not send reset link. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { email, token, newPassword });
      toast({ title: "Password Reset! ✓", description: "You can now sign in with your new password." });
      setStep("done");
    } catch (err) {
      const msg = typeof err.response?.data === "string" ? err.response.data : "Invalid or expired token.";
      toast({ title: "Reset Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0F172A] overflow-hidden">
      {/* Left side */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#7C3AED]/40 via-[#5B21B6]/30 to-[#0F172A]">
        <div className="absolute top-20 left-20 h-80 w-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 bg-purple-400/15 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 shadow-xl shadow-purple-500/20 border border-white/10">
            <img src={logo} alt="Eventora" className="h-10 w-10" />
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">
            Reset Your<br /><span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Password</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-lg mb-10">
            No worries. Recover your account securely and get back to managing campus events.
          </p>
          <div className="space-y-4">
            {[
              { icon: ShieldCheck, title: "Secure Recovery", desc: "Your account security is our priority." },
              { icon: Sparkles,    title: "Fast Access",     desc: "Reset and continue instantly." },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/20 rounded-3xl p-8">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-lg shadow-purple-500/30">
                <img src={logo} alt="Eventora" className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Eventora</h2>
                <p className="text-xs text-slate-400">Campus Event Platform</p>
              </div>
            </Link>

            {/* STEP 1: Request reset */}
            {step === "email" && !sent && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                  <p className="text-slate-400 leading-relaxed">Enter your email and we'll send you a secure password reset token.</p>
                </div>
                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white">
                    {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span> : "Send Reset Token"}
                  </Button>
                </form>
              </>
            )}

            {/* STEP 2: Token sent — enter token + new password */}
            {step === "email" && sent && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                  <p className="text-slate-400">Enter the reset token from your notification and your new password.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Reset Token</Label>
                    <Input placeholder="Paste token from notification" value={token} onChange={e => setToken(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input type={showPassword ? "text" : "password"} placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white">
                    {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</span> : "Reset Password"}
                  </Button>
                  <button type="button" onClick={() => setSent(false)} className="w-full text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    ← Resend token to a different email
                  </button>
                </form>
              </>
            )}

            {/* STEP 3: Done */}
            {step === "done" && (
              <div className="text-center py-4">
                <div className="h-20 w-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Password Reset!</h2>
                <p className="text-slate-400 mb-6">Your password has been updated. You can now sign in with your new credentials.</p>
                <Link to="/login" className="w-full inline-block rounded-2xl py-3.5 text-white font-semibold text-center bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-lg shadow-purple-500/30">
                  Go to Sign In
                </Link>
              </div>
            )}

            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 mt-8 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;