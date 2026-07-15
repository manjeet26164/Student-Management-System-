import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roles = ["student", "faculty", "admin"];

const roleHome = {
  student: "/student/dashboard",
  faculty: "/faculty/dashboard",
  admin: "/admin/dashboard",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await login({ ...form, role });
      navigate(roleHome[role]);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Unable to login. Check your credentials.",
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
                onClick={() => setRole(r)}
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
              {loading ? "Signing in..." : "Access Portal"}
            </button>
          </form>

          {message.text ? <p className={`form-message ${message.type}`}>{message.text}</p> : null}

          {import.meta.env.DEV ? (
            <div className="demo-credentials">
              <p>Demo IDs:</p>
              <small>Student: STU23001 / Student@123</small>
              <small>Faculty: FAC2101 / Faculty@123</small>
              <small>Admin: ADM1001 / Admin@123</small>
            </div>
          ) : (
            <div className="demo-credentials">
              <small>Forgot your credentials? Contact your university administration office.</small>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
