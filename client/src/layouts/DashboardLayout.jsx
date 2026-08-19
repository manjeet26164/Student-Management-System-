import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ChatbotWidget from "../components/ChatbotWidget";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "mobile-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <main className="dashboard-main">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
      <ChatbotWidget />
    </div>
  );
};

export default DashboardLayout;
