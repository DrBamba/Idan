import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const TYPES = [
  { value: "musician", label: "Musician — instrumentalist, singer" },
  { value: "producer", label: "Producer — engineer, beatmaker" },
  { value: "teacher", label: "Teacher — offer lessons" },
  { value: "business", label: "Business — shop, studio, label" },
  { value: "listener", label: "Listener — fan, playlist curator" },
];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    accountType: "musician",
  });
  const [err, setErr] = useState("");

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(form);
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="center-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand">♪ Harmonia</div>
        <p className="muted" style={{ marginTop: -8 }}>
          Create your musician profile.
        </p>
        <label>
          <span>Display name</span>
          <input
            value={form.displayName}
            onChange={(e) => set("displayName", e.target.value)}
          />
        </label>
        <label>
          <span>Username</span>
          <input
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
        </label>
        <label>
          <span>Account type</span>
          <select
            value={form.accountType}
            onChange={(e) => set("accountType", e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        {err && <div style={{ color: "var(--bad)", marginBottom: 8 }}>{err}</div>}
        <button className="btn full" type="submit">
          Create account
        </button>
        <p className="muted" style={{ marginTop: 12 }}>
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
