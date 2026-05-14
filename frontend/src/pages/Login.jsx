import { useState } from "react";
import toast from "react-hot-toast";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "anusha@talentflow.io",
    password: "password123",
  });

  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    toast.success("Login successful");

    onLogin({
      name: "Anusha Reddy",
      email: form.email,
      initials: "AR",
    });
  };

  const handleGoogleLogin = () => {
    toast.success("Google login successful");

    onLogin({
      name: "Anusha Reddy",
      email: "anusha@talentflow.io",
      initials: "AR",
    });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-logo">TalentFlow</div>
        <div className="auth-tagline">HR Recruitment Platform</div>

        <div className="auth-art">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`auth-art-cell ${
                [2, 5, 8, 11, 14, 17].includes(i) ? "lit" : ""
              }`}
            />
          ))}
        </div>

        <p className="auth-side-text">
          Track positions, manage offers, and build your team — all in one
          place.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              value={form.email}
              placeholder="anusha@talentflow.io"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              placeholder="••••••••"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button className="btn-primary" onClick={handleSubmit}>
            Sign in
          </button>

          <div className="auth-divider">or continue with</div>

          <button className="btn-oauth" onClick={handleGoogleLogin}>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
