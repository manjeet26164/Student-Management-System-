import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roles = ["student", "faculty", "admin"];

const roleHome = {
  student: "/student/dashboard",
  faculty: "/faculty/dashboard",
  admin: "/admin/dashboard",
};

const demoUsers = [
  { role: "student", label: "Student", id: "STU23001", pass: "Student@123" },
  { role: "faculty", label: "Faculty", id: "FAC2101", pass: "Faculty@123" },
  { role: "admin", label: "Admin", id: "ADM1001", pass: "Admin@123" },
];

const isDev = import.meta.env.DEV;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState(() =>
    isDev ? { identifier: "STU23001", password: "Student@123" } : { identifier: "", password: "" }
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setMessage({ type: "", text: "" });
    if (isDev) {
      const demo = demoUsers.find((u) => u.role === newRole);
      if (demo) {
        setForm({ identifier: demo.id, password: demo.pass });
      }
    }
  };

  const fillDemo = (demo) => {
    setRole(demo.role);
    setForm({ identifier: demo.id, password: demo.pass });
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await login({
        identifier: form.identifier.trim(),
        password: form.password,
        role,
      });
      navigate(roleHome[role]);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        (error.message === "Network Error"
          ? "Cannot connect to server. Please verify the backend is running on port 5000."
          : "Unable to login. Check your credentials.");
      setMessage({
        type: "error",
        text: serverMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-hero">
          <div className="auth-seal">JB</div>
          <p className="auth-overline">EST. 1969 - FARIDABAD, HARYANA</p>
          <h1>
            J.C. Bose University
            <br />
            <span>of Science & Technology</span>
          </h1>
          <p className="auth-subtitle">YMCA Faridabad</p>
          <div className="hero-rule" />
          <p className="hero-copy">
            Integrated enterprise resource planning portal for students, faculty, and administrative staff.
          </p>
          <ul className="hero-list">
            <li>Academic records and transcripts</li>
            <li>Fee management and payment tracking</li>
            <li>Examination, results, and attendance</li>
            <li>Faculty and class administration</li>
          </ul>
        </section>

        <section className="auth-card">
          <p className="auth-card-overline">ERP PORTAL - SECURE ACCESS</p>
          <h2>Sign In</h2>
          <p className="auth-card-subtitle">Use your university credentials to continue</p>

          <div className="role-tabs">
            {roles.map((r) => (
              <button
                type="button"
                key={r}
                className={role === r ? "active" : ""}
                onClick={() => handleRoleChange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <label htmlFor="identifier">University ID / Email</label>
            <input
              id="identifier"
              name="identifier"
              placeholder="Enter your university ID"
              value={form.identifier}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button disabled={loading} className="btn-primary auth-submit" type="submit">
              {loading ? "Signing in..." : `Access ${role.toUpperCase()} Portal`}
            </button>
          </form>

          {message.text ? <p className={`form-message ${message.type}`}>{message.text}</p> : null}

          {isDev ? (
            <div className="demo-credentials">
              <p style={{ fontWeight: 600, color: "var(--accent)", marginBottom: "6px" }}>
                ⚡ One-Click Demo Credentials (Local Dev Only):
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {demoUsers.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => fillDemo(demo)}
                    className={`tag-btn ${role === demo.role ? "active" : ""}`}
                    style={{ fontSize: "12px", padding: "6px 10px" }}
                  >
                    {demo.label}: {demo.id}
                  </button>
                ))}
              </div>
              <small style={{ marginTop: "6px" }}>Password for all demo accounts: <code>Role@123</code></small>
            </div>
          ) : (
            <div className="demo-credentials">
              <small>Forgot your credentials? Contact your university administration branch.</small>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
