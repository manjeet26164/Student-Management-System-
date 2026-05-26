import { useState } from "react";
import { changePasswordRequest } from "../../services/authService";

const passwordRule =
  "Use at least 8 characters and include uppercase, lowercase, number, and special character.";

const hasStrongPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "Not entered", tone: "empty" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Weak", tone: "weak" };
  if (score === 2) return { score, label: "Medium", tone: "medium" };
  if (score === 3) return { score, label: "Strong", tone: "strong" };
  return { score, label: "Very Strong", tone: "very-strong" };
};

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);

  const strength = getPasswordStrength(form.newPassword);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!hasStrongPassword(form.newPassword)) {
      setMessage({ type: "error", text: passwordRule });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New and confirm password must match." });
      return;
    }

    try {
      const response = await changePasswordRequest(form);
      setMessage({ type: "success", text: response.message || "Password changed successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password" });
    }
  };

  return (
    <section className="panel panel-narrow">
      <h2>Change Password</h2>
      <p className="muted">{passwordRule}</p>
      <form className="form-grid" onSubmit={onSubmit}>
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
        />

        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          type={showNewPassword ? "text" : "password"}
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
        />

        <div className="password-meter-wrap">
          <div className="row-between">
            <small className="muted">Password strength</small>
            <strong className={`password-strength-label ${strength.tone}`}>{strength.label}</strong>
          </div>
          <div className="password-meter">
            {[1, 2, 3, 4].map((segment) => (
              <span
                key={segment}
                className={`password-meter-segment ${segment <= strength.score ? `active ${strength.tone}` : ""}`}
              />
            ))}
          </div>
        </div>

        <label className="toggle-password">
          <input
            type="checkbox"
            checked={showNewPassword}
            onChange={(event) => setShowNewPassword(event.target.checked)}
          />
          Show New Password
        </label>

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <button className="btn-primary" type="submit">
          Update Password
        </button>
      </form>
      {message.text ? <p className={`form-message ${message.type}`}>{message.text}</p> : null}
    </section>
  );
};

export default ChangePasswordPage;
