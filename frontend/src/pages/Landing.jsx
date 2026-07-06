import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Users, Award, ArrowRight, Sparkles, ScanLine, Clock, ShieldCheck,
  Shield, BarChart3, Bell, CheckCircle2, ChevronRight, Activity, Laptop
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import heroCampus from "@/assets/hero-campus.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/public");
        setStats(res.data); // Removed .data since interceptor unwraps it
      } catch (error) {
        console.error("Failed to fetch public stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const features = [
    { icon: Calendar, title: "Event Registration", description: "Seamless, one-click registration process for students." },
    { icon: Clock, title: "Attendance Tracking", description: "Effortlessly track student attendance for all your events." },
    { icon: Award, title: "Digital Certificates", description: "Beautiful, verified certificates generated instantly." },
    { icon: ShieldCheck, title: "Approval Workflows", description: "Secure, multi-tier event approval system for admins." },
    { icon: BarChart3, title: "Deep Analytics", description: "Real-time engagement metrics and attendance tracking." },
    { icon: Bell, title: "Smart Notifications", description: "Automated reminders and updates for all participants." },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden selection:bg-purple-500/30 font-sans">
      <Navbar />

      {/* ─── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-20 pb-32">
        {/* Background Image with Dark Overlay (No blur so image is crisp) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={heroCampus} alt="Campus Background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#020617]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
        </div>

        {/* Animated Background Gradients (Blobs) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        {/* Subtle Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none backdrop-blur-xl bg-white/10 border-white/20"
        />

        <div className="container relative z-10 text-center px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-300">The Next Generation of Campus Events</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            Elevate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">
              Campus Experience
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A premium, end-to-end platform for discovering events, tracking attendance, and generating digital certificates with unmatched elegance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={() => navigate("/register")}
              className="group relative px-8 py-4 w-full sm:w-auto rounded-2xl bg-white text-slate-900 font-bold text-lg overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 w-full sm:w-auto rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg backdrop-blur-md hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ─── LIVE STATISTICS SECTION ─────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-20 px-4" id="statistics">
        <div className="container max-w-6xl">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-center gap-3 mb-10">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Live Platform Metrics</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-white/10">
              {loading ? (
                // Skeletons
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center px-4 animate-pulse">
                    <div className="h-10 w-24 bg-white/5 rounded-lg mb-3" />
                    <div className="h-4 w-32 bg-white/5 rounded-md" />
                  </div>
                ))
              ) : (
                <>
                  <div className="flex flex-col items-center px-4 group">
                    <span className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-500">
                      {stats?.totalUsers || 0}
                    </span>
                    <span className="text-sm font-medium text-slate-400">Active Users</span>
                  </div>
                  <div className="flex flex-col items-center px-4 group">
                    <span className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-fuchsia-600">
                      {stats?.totalEvents || 0}
                    </span>
                    <span className="text-sm font-medium text-slate-400">Events Hosted</span>
                  </div>
                  <div className="flex flex-col items-center px-4 group">
                    <span className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-indigo-600">
                      {stats?.totalRegistrations || 0}
                    </span>
                    <span className="text-sm font-medium text-slate-400">Total Registrations</span>
                  </div>
                  <div className="flex flex-col items-center px-4 group">
                    <span className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-teal-600">
                      {stats?.certificatesIssued || 0}
                    </span>
                    <span className="text-sm font-medium text-slate-400">Certificates Issued</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PREMIUM FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-32 relative" id="features">
        <div className="container max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need, <br/><span className="text-slate-400">perfectly executed.</span></h2>
            <p className="text-slate-400 text-lg">Eventora provides a complete toolkit for organizing, managing, and tracking campus events with a frictionless user experience.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div 
                key={i}
                className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-slate-800/50 hover:border-purple-500/30 transition-all duration-500"
              >
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-colors duration-300">
                    <feat.icon className="w-7 h-7 text-slate-300 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (WORKFLOW) ─────────────────────────────────────────────── */}
      <section className="py-32 relative bg-slate-900/20 border-y border-white/5 overflow-hidden" id="how-it-works">
        {/* Decorative Grid */}
        <div 
          className="absolute inset-0 pointer-events-none backdrop-blur-xl bg-white/10 border-white/20"
        />

        <div className="container max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Designed for every role.</h2>
            <p className="text-slate-400 text-lg">A seamless workflow tailored specifically for Students, Coordinators, and Admins.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Student Flow */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 w-12 h-12 bg-blue-500/20 rounded-full blur-xl" />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">Student Flow</h3>
              </div>
              <div className="space-y-6">
                {['Discover Events', 'Register in One Click', 'Attend Events', 'Receive Certificate'].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">{i+1}</div>
                    <span className="text-slate-300 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinator Flow */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 relative shadow-[0_0_30px_rgba(168,85,247,0.05)] scale-100 lg:scale-105 z-10">
              <div className="absolute top-0 right-8 -translate-y-1/2 w-12 h-12 bg-purple-500/20 rounded-full blur-xl" />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Coordinator Flow</h3>
              </div>
              <div className="space-y-6">
                {['Create Event Proposal', 'Manage Registrations', 'Track Attendance', 'Issue Certificates'].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">{i+1}</div>
                    <span className="text-white font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Flow */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl" />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Admin Flow</h3>
              </div>
              <div className="space-y-6">
                {['Review Proposals', 'Approve/Reject Events', 'Monitor Global Stats', 'Manage System Roles'].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">{i+1}</div>
                    <span className="text-slate-300 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BOTTOM ─────────────────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20" />
        <div className="container max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to transform your campus?</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">Join the premium platform that redefines how educational institutions handle events, attendance, and certification.</p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] inline-flex items-center gap-3"
          >
            Create Your Account <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
