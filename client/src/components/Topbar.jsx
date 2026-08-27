import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchStudentNotifications } from "../services/studentService";
import { fetchFacultyNotifications } from "../services/facultyService";

const Topbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("erp_theme") || "dark");
  const notifRef = useRef(null);

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Close notifications on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (user?.role === "student") {
          const data = await fetchStudentNotifications();
          setNotifications(data);
        } else if (user?.role === "faculty") {
          const data = await fetchFacultyNotifications();
          setNotifications(data);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [user?.role]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("erp_theme", theme);
  }, [theme]);

  const hasBell = user?.role === "student" || user?.role === "faculty";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Open Menu"
        >
          ☰
        </button>
        <div>
          <p className="topbar-label">Academic Session</p>
          <h1>University Enterprise Portal</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="date-chip">{date}</div>
        <button
          type="button"
          className="theme-btn"
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span>{theme === "dark" ? "☀️ Light" : "🌙 Dark"}</span>
        </button>
        {hasBell ? (
          <div className="notification-wrap" ref={notifRef}>
            <button
              type="button"
              className={`notif-btn ${open ? "active" : ""}`}
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle notifications"
              aria-expanded={open}
              title="Notifications"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6h-1V11a6 6 0 1 0-12 0v5H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2Z"
                  fill="currentColor"
                />
              </svg>
              {notifications.length ? <span className="notif-count">{notifications.length}</span> : null}
            </button>
            {open ? (
              <div className="notif-popover" role="region" aria-label="Notifications list">
                <div className="notif-popover-header">
                  <h4>Notifications</h4>
                  {notifications.length ? (
                    <span className="notif-badge">{notifications.length}</span>
                  ) : null}
                </div>
                <div className="notif-list">
                  {notifications.length ? (
                    notifications.map((item, index) => (
                      <article key={`${item.title}-${index}`} className={`notif-item ${item.type || "info"}`}>
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                      </article>
                    ))
                  ) : (
                    <p className="muted notif-empty">No notifications</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="user-chip">
          <span>{user?.fullName}</span>
          <small>{user?.role?.toUpperCase()}</small>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
