import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";   // NEW — Feature 1
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import SelectRole from "./pages/auth/SelectRole";

// Shared pages
import Notifications from "./pages/Notifications";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import BrowseEvents from "./pages/student/BrowseEvents";
import MyRegistrations from "./pages/student/MyRegistrations";
import Certificates from "./pages/student/Certificates";
import Profile from "./pages/student/Profile";

// Coordinator pages
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CreateEvent from "./pages/coordinator/CreateEvent";
import ManageEvents from "./pages/coordinator/ManageEvents";
import Participants from "./pages/coordinator/Participants";
import Attendance from "./pages/coordinator/Attendance";
import Reports from "./pages/coordinator/Reports";
import EventFeedback from "./pages/coordinator/EventFeedback";
import CoordinatorCertificates from "./pages/coordinator/Certificates";
import QrScanner from "./pages/coordinator/QrScanner";    // NEW — Feature 8

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ApproveEvents from "./pages/admin/ApproveEvents";
import Categories from "./pages/admin/Categories";
import Analytics from "./pages/admin/Analytics";
import AuditLogs from "./pages/admin/AuditLogs";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import CertificateManagement from "./pages/admin/CertificateManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <Routes>
            {/* ── Public ───────────────────────────────────────────────── */}
            <Route path="/"               element={<Landing />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/verify-otp"     element={<OtpVerification />} />  {/* NEW */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/select-role"    element={<SelectRole />} />

            {/* ── Student ──────────────────────────────────────────────── */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/browse-events" element={
              <ProtectedRoute allowedRoles={["student"]}><BrowseEvents /></ProtectedRoute>} />
            <Route path="/student/my-registrations" element={
              <ProtectedRoute allowedRoles={["student"]}><MyRegistrations /></ProtectedRoute>} />
            <Route path="/student/certificates" element={
              <ProtectedRoute allowedRoles={["student"]}><Certificates /></ProtectedRoute>} />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={["student"]}><Profile /></ProtectedRoute>} />
            <Route path="/student/notifications" element={
              <ProtectedRoute allowedRoles={["student"]}><Notifications /></ProtectedRoute>} />

            {/* ── Coordinator ──────────────────────────────────────────── */}
            <Route path="/coordinator/dashboard" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorDashboard /></ProtectedRoute>} />
            <Route path="/coordinator/create-event" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><CreateEvent /></ProtectedRoute>} />
            <Route path="/coordinator/manage-events" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><ManageEvents /></ProtectedRoute>} />
            <Route path="/coordinator/participants" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><Participants /></ProtectedRoute>} />
            <Route path="/coordinator/attendance" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><Attendance /></ProtectedRoute>} />
            <Route path="/coordinator/qr-scanner" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><QrScanner /></ProtectedRoute>} /> {/* NEW */}
            <Route path="/coordinator/reports" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><Reports /></ProtectedRoute>} />
            <Route path="/coordinator/feedback" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><EventFeedback /></ProtectedRoute>} />
            <Route path="/coordinator/issue-certificates" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorCertificates /></ProtectedRoute>} />
            <Route path="/coordinator/notifications" element={
              <ProtectedRoute allowedRoles={["coordinator"]}><Notifications /></ProtectedRoute>} />

            {/* ── Admin ────────────────────────────────────────────────── */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/events" element={
              <ProtectedRoute allowedRoles={["admin"]}><ApproveEvents /></ProtectedRoute>} />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={["admin"]}><Categories /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={["admin"]}><Analytics /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute allowedRoles={["admin"]}><AuditLogs /></ProtectedRoute>} />
            <Route path="/admin/feedback" element={
              <ProtectedRoute allowedRoles={["admin"]}><FeedbackManagement /></ProtectedRoute>} />
            <Route path="/admin/certificates" element={
              <ProtectedRoute allowedRoles={["admin"]}><CertificateManagement /></ProtectedRoute>} />

            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={["admin"]}><Notifications /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
