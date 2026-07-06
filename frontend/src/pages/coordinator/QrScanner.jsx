import { useEffect, useRef, useState } from "react";
import { QrCode, CheckCircle, XCircle, AlertTriangle, Camera, StopCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import API from "../../services/api";

/**
 * QrScanner — coordinator page for scanning student QR codes.
 *
 * Uses the html5-qrcode library (install: npm i html5-qrcode)
 * When a QR is scanned it calls POST /api/registrations/attendance/scan
 */
const QrScanner = () => {
  const { toast }       = useToast();
  const scannerRef      = useRef(null);
  const html5QrRef      = useRef(null);

  const [scanning, setScanning]       = useState(false);
  const [lastResult, setLastResult]   = useState(null); // { code, status, message }
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [manualCode, setManualCode]   = useState("");

  /* ── Start scanner ──────────────────────────────────────────────────────── */

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5QrRef.current = new Html5Qrcode("qr-reader");

      await html5QrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        () => {}               // ignore verbose frame errors
      );
      setScanning(true);
    } catch (err) {
      toast({
        title: "Camera error",
        description: err.message || "Could not access the camera.",
        variant: "destructive",
      });
    }
  };

  /* ── Stop scanner ───────────────────────────────────────────────────────── */

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch { /* ignore */ }
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => () => { stopScanner(); }, []);

  /* ── Handle scan ────────────────────────────────────────────────────────── */

  const handleScanSuccess = async (code) => {
    if (loading) return;
    // Pause scanning while processing
    await stopScanner();
    await submitAttendance(code);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await submitAttendance(manualCode.trim().toUpperCase());
    setManualCode("");
  };

  const submitAttendance = async (qrCode) => {
    setLoading(true);
    try {
      const res = await API.post("/registrations/attendance/scan", { qrCode });
      const msg = res.data?.message || "Done";

      const isSuccess  = msg.toLowerCase().includes("successfully");
      const isDuplicate = msg.toLowerCase().includes("already");

      const entry = {
        id: Date.now(),
        code: qrCode,
        message: msg,
        type: isSuccess ? "success" : isDuplicate ? "warning" : "error",
        time: new Date().toLocaleTimeString(),
      };

      setLastResult(entry);
      setHistory(prev => [entry, ...prev.slice(0, 19)]);

      toast({
        title: isSuccess ? "✅ Attendance Marked" : isDuplicate ? "⚠️ Already Recorded" : "❌ Invalid QR",
        description: msg,
        variant: isSuccess ? "default" : "destructive",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Scan failed";
      const entry = { id: Date.now(), code: qrCode, message: msg, type: "error", time: new Date().toLocaleTimeString() };
      setLastResult(entry);
      setHistory(prev => [entry, ...prev.slice(0, 19)]);
      toast({ title: "Scan Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ── Status icon ─────────────────────────────────────────────────────────── */

  const StatusIcon = ({ type, size = "w-5 h-5" }) => {
    if (type === "success") return <CheckCircle className={`${size} text-green-500`} />;
    if (type === "warning") return <AlertTriangle className={`${size} text-yellow-500`} />;
    return <XCircle className={`${size} text-red-500`} />;
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="w-7 h-7 text-indigo-600" />
          QR Attendance Scanner
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Scan student QR codes or enter them manually to mark attendance.
        </p>
      </div>

      {/* Scanner area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-medium text-gray-700">Camera Scanner</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${scanning ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {scanning ? "● Active" : "Inactive"}
          </span>
        </div>

        {/* Camera viewfinder */}
        <div className="relative bg-gray-900" style={{ minHeight: 320 }}>
          <div id="qr-reader" ref={scannerRef} className="w-full" />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <Camera className="w-16 h-16 opacity-30" />
              <p className="text-sm opacity-50">Camera not active</p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Processing…</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex gap-3">
          {!scanning ? (
            <button
              onClick={startScanner}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-indigo-600 text-white font-medium hover:bg-indigo-700
                         disabled:opacity-50 transition"
            >
              <Camera className="w-4 h-4" /> Start Camera
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-red-500 text-white font-medium hover:bg-red-600 transition"
            >
              <StopCircle className="w-4 h-4" /> Stop Camera
            </button>
          )}
        </div>
      </div>

      {/* Manual entry */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-medium text-gray-700 mb-3">Manual Entry</h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={e => setManualCode(e.target.value.toUpperCase())}
            placeholder="e.g. REG12345AB"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                       text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium
                       hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Last scan result */}
      {lastResult && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3
          ${lastResult.type === "success" ? "bg-green-50 border-green-200"
            : lastResult.type === "warning" ? "bg-yellow-50 border-yellow-200"
            : "bg-red-50 border-red-200"}`}>
          <StatusIcon type={lastResult.type} size="w-6 h-6 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-800">{lastResult.message}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">Code: {lastResult.code}</p>
          </div>
        </div>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Scan History</h3>
            <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-gray-600">
              Clear
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {history.map(item => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                <StatusIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-700 truncate">{item.code}</p>
                  <p className="text-xs text-gray-500">{item.message}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
