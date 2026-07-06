import { useEffect, useState, useRef, useMemo } from "react";
import { Award, Search, CheckCircle, FileText, Download, Clock, User, Mail, Calendar, MapPin, XCircle } from "lucide-react";
import certificateService from "../../services/certificateService";

const getAvatarInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
};

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuingToken, setIssuingToken] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ELIGIBLE, ISSUED, PENDING

  // Prevent double fetch in StrictMode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await certificateService.getCoordinatorCertificates();
      const data = response.data?.data || response.data || response || [];
      const dataArray = Array.isArray(data) ? data : [];
      setCertificates(dataArray);
    } catch (error) {
      console.error("Failed to fetch certificate data", error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificateStatus = (item) => {
    if (item.certificateIssued === true) return "ISSUED";
    if (item.attendanceStatus === "PRESENT" && item.certificateIssued === false) return "ELIGIBLE";
    return "PENDING";
  };

  const handleIssue = async (registrationId) => {
    try {
      setIssuingToken(registrationId);
      const response = await certificateService.issueCertificateByToken(registrationId);
      
      // Update state directly for instant UI feedback without refresh
      setCertificates((prev) =>
        prev.map((cert) => {
          if (cert.registrationId === registrationId) {
            return {
              ...cert,
              certificateIssued: true,
              issuedDate: response.data?.issuedDate || new Date().toISOString(),
            };
          }
          return cert;
        })
      );
    } catch (error) {
      console.error("Failed to issue certificate", error);
      alert("Failed to issue certificate.");
    } finally {
      setIssuingToken(null);
    }
  };

  const showToast = (msg, isError = false) => {
    setToastMessage({ msg, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = async (cert) => {
    try {
      setDownloading(cert.registrationId);
      
      const blob = await certificateService.downloadCertificateByToken(cert.registrationId);
      
      if (!(blob instanceof Blob)) {
        throw new Error("Invalid response format");
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      const safeName = cert.studentName ? cert.studentName.replace(/\s+/g, "_") : "Student";
      const safeEvent = cert.eventTitle ? cert.eventTitle.replace(/\s+/g, "_") : "Event";
      const fileName = `Certificate_${safeName}_${safeEvent}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("Certificate downloaded successfully");
    } catch (error) {
      console.error("Download failed", error);
      showToast("Failed to download certificate.", true);
    } finally {
      setDownloading(null);
    }
  };

  // Derive unique event names for the filter dropdown
  const uniqueEvents = useMemo(() => {
    const events = new Set(certificates.map((cert) => cert.eventTitle).filter(Boolean));
    return ["ALL", ...Array.from(events)];
  }, [certificates]);

  // Filter Logic
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        (cert.studentName && cert.studentName.toLowerCase().includes(search)) ||
        (cert.studentEmail && cert.studentEmail.toLowerCase().includes(search)) ||
        (cert.eventTitle && cert.eventTitle.toLowerCase().includes(search));

      const matchesEvent = eventFilter === "ALL" || cert.eventTitle === eventFilter;

      const status = getCertificateStatus(cert);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [certificates, searchTerm, eventFilter, statusFilter]);

  // Section Data
  const eligibleCerts = useMemo(() => filteredCertificates.filter((c) => getCertificateStatus(c) === "ELIGIBLE"), [filteredCertificates]);
  const issuedCerts = useMemo(() => filteredCertificates.filter((c) => getCertificateStatus(c) === "ISSUED"), [filteredCertificates]);
  const pendingCerts = useMemo(() => filteredCertificates.filter((c) => getCertificateStatus(c) === "PENDING"), [filteredCertificates]);

  // Stats Logic
  const stats = useMemo(() => {
    return {
      total: certificates.length,
      eligible: certificates.filter((x) => getCertificateStatus(x) === "ELIGIBLE").length,
      issued: certificates.filter((x) => getCertificateStatus(x) === "ISSUED").length,
      pending: certificates.filter((x) => getCertificateStatus(x) === "PENDING").length,
    };
  }, [certificates]);

  const StatusBadge = ({ status, fullWidth = false }) => {
    const baseClasses = `inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${fullWidth ? 'w-full' : ''}`;
    switch (status) {
      case "ISSUED":
        return (
          <span className={`${baseClasses} bg-green-500/20 border border-green-500/30 text-green-400`}>
            <CheckCircle className="w-3.5 h-3.5" /> Issued
          </span>
        );
      case "ELIGIBLE":
        return (
          <span className={`${baseClasses} bg-blue-500/20 border border-blue-500/30 text-blue-400`}>
            <CheckCircle className="w-3.5 h-3.5" /> Eligible
          </span>
        );
      case "PENDING":
        return (
          <span className={`${baseClasses} bg-orange-500/20 border border-orange-500/30 text-orange-400`}>
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "PRESENT":
        return (
          <span className={`${baseClasses} bg-green-500/20 border border-green-500/30 text-green-400`}>
            <CheckCircle className="w-3.5 h-3.5" /> Present
          </span>
        );
      case "ABSENT":
        return (
          <span className={`${baseClasses} bg-red-500/20 border border-red-500/30 text-red-400`}>
            <XCircle className="w-3.5 h-3.5" /> Absent
          </span>
        );
      default:
        return null;
    }
  };

  const renderSkeletonCards = (count) => {
    return [...Array(count)].map((_, i) => (
      <div key={`skeleton-${i}`} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/10"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
        <div className="h-10 bg-white/10 rounded-xl w-full"></div>
      </div>
    ));
  };

  return (
    <div className="space-y-10 pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-50 text-white font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 ${toastMessage.isError ? 'bg-red-500' : 'bg-green-500'}`}>
          {toastMessage.isError ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toastMessage.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Award className="text-purple-400 w-8 h-8" /> Certificate Management
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Manage eligible, pending and issued certificates.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Eligible Certificates", value: stats.eligible, color: "from-blue-600/20 to-blue-800/10", border: "border-blue-500/30", icon: <Award className="w-6 h-6 text-blue-400" /> },
          { label: "Issued Certificates", value: stats.issued, color: "from-green-600/20 to-green-800/10", border: "border-green-500/30", icon: <CheckCircle className="w-6 h-6 text-green-400" /> },
          { label: "Pending Certificates", value: stats.pending, color: "from-orange-600/20 to-orange-800/10", border: "border-orange-500/30", icon: <Clock className="w-6 h-6 text-orange-400" /> },
          { label: "Total Certificates", value: stats.total, color: "from-purple-600/20 to-purple-800/10", border: "border-purple-500/30", icon: <FileText className="w-6 h-6 text-purple-400" /> },
        ].map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${card.color} border ${card.border} backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
              {card.icon}
            </div>
            <p className="text-sm font-medium text-slate-300 mb-1">{card.label}</p>
            <p className="text-4xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3 justify-end">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 appearance-none min-w-[200px]"
          >
            {uniqueEvents.map((event) => (
              <option key={event} value={event} className="bg-slate-900 text-white">
                {event === "ALL" ? "All Events" : event}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 appearance-none min-w-[150px]"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
            <option value="ELIGIBLE" className="bg-slate-900 text-white">Eligible</option>
            <option value="ISSUED" className="bg-slate-900 text-white">Issued</option>
            <option value="PENDING" className="bg-slate-900 text-white">Pending</option>
          </select>
        </div>
      </div>

      <div className="space-y-12">
        {/* ELIGIBLE SECTION */}
        {(statusFilter === "ALL" || statusFilter === "ELIGIBLE") && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Eligible For Certificate</h2>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">{eligibleCerts.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                renderSkeletonCards(3)
              ) : eligibleCerts.length === 0 ? (
                <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                  <Award className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">No eligible participants</h3>
                  <p className="text-slate-400">All present students have been issued certificates or none are currently eligible.</p>
                </div>
              ) : (
                eligibleCerts.map((cert) => (
                  <div key={cert.registrationId} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                        {getAvatarInitials(cert.studentName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate" title={cert.studentName}>{cert.studentName}</h3>
                        <p className="text-slate-400 text-sm flex items-center gap-1.5 truncate" title={cert.studentEmail}>
                          <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{cert.studentEmail}</span>
                        </p>
                      </div>
                      <StatusBadge status="ELIGIBLE" />
                    </div>
                    
                    <div className="bg-black/20 rounded-2xl p-4 mb-6 flex-1">
                      <p className="text-slate-300 text-sm font-medium mb-3 flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cert.eventTitle}</span>
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Attendance</span>
                        <StatusBadge status="PRESENT" />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleIssue(cert.registrationId)}
                      disabled={issuingToken === cert.registrationId}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                    >
                      {issuingToken === cert.registrationId ? "Issuing..." : "Issue Certificate"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ISSUED SECTION */}
        {(statusFilter === "ALL" || statusFilter === "ISSUED") && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-green-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Issued Certificates</h2>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">{issuedCerts.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                renderSkeletonCards(3)
              ) : issuedCerts.length === 0 ? (
                <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">No certificates issued yet</h3>
                  <p className="text-slate-400">Certificates you issue will appear here.</p>
                </div>
              ) : (
                issuedCerts.map((cert) => (
                  <div key={cert.registrationId} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] group flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg shrink-0">
                        {getAvatarInitials(cert.studentName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate" title={cert.studentName}>{cert.studentName}</h3>
                        <p className="text-slate-400 text-sm truncate" title={cert.eventTitle}>{cert.eventTitle}</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-2xl p-4 mb-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-400 text-sm">Status</span>
                        <StatusBadge status="ISSUED" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Issue Date</span>
                        <span className="text-slate-200 text-sm font-medium">
                          {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : "-"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDownload(cert)}
                        disabled={downloading === cert.registrationId}
                        className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {downloading === cert.registrationId ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* PENDING SECTION */}
        {(statusFilter === "ALL" || statusFilter === "PENDING") && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Pending Certificates</h2>
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">{pendingCerts.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                renderSkeletonCards(3)
              ) : pendingCerts.length === 0 ? (
                <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                  <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">No pending participants</h3>
                  <p className="text-slate-400">All registered students are either eligible or already issued certificates.</p>
                </div>
              ) : (
                pendingCerts.map((cert) => (
                  <div key={cert.registrationId} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] group flex flex-col h-full opacity-80 hover:opacity-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-lg shrink-0 grayscale group-hover:grayscale-0 transition-all">
                        {getAvatarInitials(cert.studentName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-200 truncate" title={cert.studentName}>{cert.studentName}</h3>
                        <p className="text-slate-500 text-sm truncate" title={cert.eventTitle}>{cert.eventTitle}</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-2xl p-4 mt-auto">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Status</span>
                          <StatusBadge status="PENDING" />
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                          <span className="text-slate-400 text-sm">Reason</span>
                          <span className={`text-sm font-semibold ${cert.attendanceStatus === 'ABSENT' ? 'text-red-400' : 'text-orange-400'}`}>
                            {cert.attendanceStatus === 'ABSENT' ? 'Attendance Absent' : 'Attendance Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Certificates;
