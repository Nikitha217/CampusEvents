import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import API from "../services/api";
import logo from "../assets/logo.png";

/**
 * OtpVerification — Step 2 of the signup flow.
 *
 * Receives pending signup data via location state from Register page:
 *   { name, email, password, role }
 *
 * Usage: navigate("/verify-otp", { state: signupData })
 */
const OtpVerification = () => {
  const navigate   = useNavigate();
  const { toast }  = useToast();

  // Retrieve pending registration from navigation state
  const [pendingData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("otp_pending") || "{}");
    } catch { return {}; }
  });

  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess]   = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  // If no pending data, redirect to register
  useEffect(() => {
    if (!pendingData.email) navigate("/register", { replace: true });
  }, [pendingData, navigate]);

  // ── OTP input handlers ────────────────────────────────────────────────────

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;           // digits only
    const next = [...otp];
    next[index] = value.slice(-1);              // single digit
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Submit OTP ────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast({ title: "Enter the complete 6-digit OTP", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", { email: pendingData.email, otp: code });
      setSuccess(true);
      sessionStorage.removeItem("otp_pending");
      toast({ title: "Account created successfully!", description: "Redirecting to login…" });
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP. Please try again.";
      toast({ title: "Verification failed", description: msg, variant: "destructive" });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.every(d => d !== "") && !loading && !success) handleSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await API.post("/auth/resend-otp", { email: pendingData.email });
      toast({ title: "OTP resent!", description: "Check your email for a new 6-digit code." });
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast({
        title: "Failed to resend OTP",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-800">Account Created!</h2>
          <p className="text-gray-500 mt-2">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Eventora" className="h-12 object-contain" />
          </div>

          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <Mail className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-gray-500 text-sm text-center mt-2">
              We sent a 6-digit code to<br />
              <span className="font-medium text-gray-700">{pendingData.email}</span>
            </p>
          </div>

          {/* OTP input */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                    ${digit ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-800"}
                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.some(d => !d)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                         text-white font-semibold text-sm shadow-md hover:opacity-90 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying…
                </span>
              ) : "Verify & Create Account"}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Didn't receive it?{" "}
              {countdown > 0 ? (
                <span className="text-gray-400">Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </p>
          </div>

          {/* Back */}
          <div className="text-center mt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-gray-400 text-sm hover:text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Register
            </Link>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          The code expires in 10 minutes. Check your spam folder if you don't see it.
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
