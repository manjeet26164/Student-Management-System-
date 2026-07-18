import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ChatbotWidget from "../components/ChatbotWidget";

const DashboardLayout = () => {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar />
        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
      <ChatbotWidget />
    </div>
  );
};

export default DashboardLayout;
