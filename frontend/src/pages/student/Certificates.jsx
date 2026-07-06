import { useState, useEffect } from "react";
import { Download, Award, FileText, Eye, Calendar, Lock, Star, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import certificateService from "../../services/certificateService";

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (user) fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const studentId = user?.id?.toString() || "";
      if (!studentId) return;
      const data = await certificateService.getStudentCertificates(studentId);
      setCertificates(data);
    } catch (error) {
      console.error("Certificate fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (cert) => {
    if (!cert.certificateUrl) return;
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
    window.open(`${API_BASE}${cert.certificateUrl}`, "_blank");
  };

  const handleDownload = async (cert) => {
    if (!cert.certificateUrl) return;
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
      setDownloading(cert.id || cert._id);
      const response = await fetch(`${API_BASE}${cert.certificateUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName =
        `${cert.eventTitle || "certificate"}_${cert.studentName || "student"}`
          .replace(/\s+/g, "_")
          .toLowerCase() + ".pdf";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <Award className="absolute inset-0 m-auto h-5 w-5 text-purple-400" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">
            Loading your certificates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-transparent border border-violet-500/20 p-8">
        {/* background glow blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/40 flex-shrink-0">
            <Award className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Certificates</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Your achievements, verified and ready to share
            </p>
          </div>
          {certificates.length > 0 && (
            <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-semibold">
              <Star className="h-4 w-4 fill-violet-400 text-violet-400" />
              {certificates.length} Earned
            </div>
          )}
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {certificates.length === 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-slate-500/10 border border-white/10 flex items-center justify-center">
              <Lock className="h-10 w-10 text-slate-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center">
              <span className="text-slate-400 text-xs font-bold">0</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">No Certificates Yet</h2>
          <p className="text-slate-500 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
            Register for events, attend them, and get marked{" "}
            <span className="text-emerald-400 font-semibold">PRESENT</span> by
            the coordinator to unlock your certificate.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-600">
            {["Register", "Attend", "Get Marked", "Download"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                  {i + 1}
                </div>
                <span>{step}</span>
                {i < 3 && <span className="text-slate-700">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CERTIFICATE CARDS ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {certificates.map((cert, index) => (
          <div
            key={`${cert.id || cert._id}-${index}`}
            className="group relative overflow-hidden bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 hover:border-purple-500/30 hover:scale-[1.015] transition-all duration-300"
          >

            {/* top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 rounded-t-3xl" />

            {/* background watermark */}
            <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
              <Award className="h-40 w-40 text-purple-400" />
            </div>

            <div className="relative p-6">

              {/* ── CARD HEADER ── */}
              <div className="flex gap-4 items-start">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600/40 to-purple-700/40 border border-violet-500/30 flex items-center justify-center flex-shrink-0 shadow-inner shadow-purple-500/20 group-hover:from-violet-600/60 group-hover:to-purple-700/60 transition-all">
                  <FileText className="h-6 w-6 text-purple-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg text-white leading-tight line-clamp-2">
                    {cert.eventTitle}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Issued to{" "}
                    <span className="text-purple-300 font-semibold">
                      {cert.studentName}
                    </span>
                  </p>
                </div>

                {/* verified badge */}
                <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </div>
              </div>

              {/* ── META INFO ── */}
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-slate-400 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  {cert.generatedDate
                    ? new Date(cert.generatedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Recently issued"}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-slate-400 text-xs">
                  <Award className="h-3.5 w-3.5 text-purple-400" />
                  Participation Certificate
                </div>
              </div>

              {/* ── DIVIDER ── */}
              <div className="mt-5 border-t border-white/8" />

              {/* ── ACTION BUTTONS ── */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleView(cert)}
                  className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm font-medium text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>

                <button
                  onClick={() => handleDownload(cert)}
                  disabled={downloading === (cert.id || cert._id)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {downloading === (cert.id || cert._id) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;