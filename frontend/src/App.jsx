import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import BrowseEvents from "./pages/student/BrowseEvents";
import MyRegistrations from "./pages/student/MyRegistrations";
import Certificates from "./pages/student/Certificates";
import Notifications from "./pages/student/Notifications";
import Profile from "./pages/student/Profile";

// Coordinator pages
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CreateEvent from "./pages/coordinator/CreateEvent";
import ManageEvents from "./pages/coordinator/ManageEvents";
import Participants from "./pages/coordinator/Participants";
import Attendance from "./pages/coordinator/Attendance";
import Reports from "./pages/coordinator/Reports";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ApproveEvents from "./pages/admin/ApproveEvents";
import Categories from "./pages/admin/Categories";
import Analytics from "./pages/admin/Analytics";
import AuditLogs from "./pages/admin/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/browse-events" element={<ProtectedRoute allowedRoles={["student"]}><BrowseEvents /></ProtectedRoute>} />
            <Route path="/student/registrations" element={<ProtectedRoute allowedRoles={["student"]}><MyRegistrations /></ProtectedRoute>} />
            <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={["student"]}><Certificates /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={["student"]}><Notifications /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><Profile /></ProtectedRoute>} />

            {/* Coordinator routes */}
            <Route path="/coordinator/dashboard" element={<ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorDashboard /></ProtectedRoute>} />
            <Route path="/coordinator/create-event" element={<ProtectedRoute allowedRoles={["coordinator"]}><CreateEvent /></ProtectedRoute>} />
            <Route path="/coordinator/manage-events" element={<ProtectedRoute allowedRoles={["coordinator"]}><ManageEvents /></ProtectedRoute>} />
            <Route path="/coordinator/participants" element={<ProtectedRoute allowedRoles={["coordinator"]}><Participants /></ProtectedRoute>} />
            <Route path="/coordinator/attendance" element={<ProtectedRoute allowedRoles={["coordinator"]}><Attendance /></ProtectedRoute>} />
            <Route path="/coordinator/reports" element={<ProtectedRoute allowedRoles={["coordinator"]}><Reports /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/manage-users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/approve-events" element={<ProtectedRoute allowedRoles={["admin"]}><ApproveEvents /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><Categories /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><Analytics /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["admin"]}><AuditLogs /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
