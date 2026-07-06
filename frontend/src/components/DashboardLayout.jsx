import { useState } from "react";
import Navbar from "./Navbar";
import AppSidebar from "./AppSidebar";
import Footer from "./Footer";

/**
 * DashboardLayout — Full-height SaaS shell.
 *
 * ROOT CAUSE FIX:
 *   Previous layout used `min-h-screen flex flex-col` on root and
 *   `overflow-hidden` on the body row, but AppSidebar used `fixed` +
 *   `lg:static`. On desktop the sidebar was removed from the flex-flow
 *   by `fixed`, so `h-screen` inside it referenced the viewport from
 *   the very top, causing it to overflow the navbar area and appear
 *   truncated below.
 *
 * CORRECT APPROACH (Vercel / Supabase / Linear pattern):
 *   - Root is `h-screen flex flex-col overflow-hidden` (FIXED total height)
 *   - Navbar gets `shrink-0` — takes its fixed h-16 slice
 *   - Body row gets `flex-1 overflow-hidden` — takes all remaining height
 *   - Sidebar gets `h-full` — fills the body row height exactly
 *   - Main gets `flex-1 overflow-y-auto` — only main content scrolls
 *   - On mobile sidebar becomes `fixed inset-y-0 left-0` with a backdrop
 *
 * This guarantees the sidebar always reaches the bottom of the screen.
 */
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /* Root: locked to viewport height — nothing overflows the shell */
    <div className="h-screen flex flex-col overflow-hidden bg-[#0F172A]">

      {/* ── Navbar: fixed-height slice at the top ───────────────────────── */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        showMenuButton
      />

      {/* ── Body: sidebar + main, fills remaining height exactly ─────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar: static on desktop, drawer on mobile */}
        <AppSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content: only this area scrolls */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
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
