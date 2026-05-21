import { useState } from "react";
import Navbar from "./Navbar";
import AppSidebar from "./AppSidebar";
import Footer from "./Footer";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} showMenuButton />
      <div className="flex flex-1">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
