import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleMenus = {
  student: [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "My Profile", path: "/student/profile" },
    { label: "Documents", path: "/student/documents" },
    { label: "Grades & Results", path: "/student/results" },
    { label: "Attendance", path: "/student/attendance" },
    { label: "Fee Details", path: "/student/fees" },
    { label: "Change Password", path: "/student/change-password" },
  ],
  faculty: [
    { label: "Dashboard", path: "/faculty/dashboard" },
    { label: "Assigned Students", path: "/faculty/students" },
    { label: "Verify Documents", path: "/faculty/documents" },
    { label: "Mark Attendance", path: "/faculty/attendance" },
    { label: "Upload Marks", path: "/faculty/marks" },
    { label: "Class Records", path: "/faculty/records" },
    { label: "Change Password", path: "/faculty/change-password" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Manage Students", path: "/admin/students" },
    { label: "Manage Faculty", path: "/admin/faculty" },
    { label: "Manage Subjects", path: "/admin/subjects" },
    { label: "Academic Ops", path: "/admin/operations" },
    { label: "Change Password", path: "/admin/change-password" },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const menus = roleMenus[user?.role] || [];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-block">
          <span className="brand-top">UNIVERSITY</span>
          <h2>ERP Portal</h2>
        </div>
        <nav className="side-nav">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button type="button" className="btn-outline sidebar-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
