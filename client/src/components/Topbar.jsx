import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchStudentNotifications } from "../services/studentService";
import { fetchFacultyNotifications } from "../services/facultyService";

const Topbar = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("erp_theme") || "dark");

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
      <div>
        <p className="topbar-label">Academic Session</p>
        <h1>University Enterprise Portal</h1>
      </div>
      <div className="topbar-actions">
        <div className="date-chip">{date}</div>
        <button
          type="button"
          className="theme-btn"
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          title="Toggle theme"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        {hasBell ? (
          <div className="notification-wrap">
            <button type="button" className="notif-btn" onClick={() => setOpen((prev) => !prev)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6h-1V11a6 6 0 1 0-12 0v5H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2Z"
                  fill="currentColor"
                />
              </svg>
              {notifications.length ? <span className="notif-count">{notifications.length}</span> : null}
            </button>
            {open ? (
              <div className="notif-popover">
                <h4>Notifications</h4>
                {notifications.length ? (
                  notifications.map((item, index) => (
                    <article key={`${item.title}-${index}`} className={`notif-item ${item.type || "info"}`}>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                    </article>
                  ))
                ) : (
                  <p className="muted">No notifications</p>
                )}
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
