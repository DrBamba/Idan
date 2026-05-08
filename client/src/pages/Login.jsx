import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [identifier, setId] = useState("");
  const [password, setPw] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(identifier, password);
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
          The social network exclusively for musicians.
        </p>
        <label>
          <span>Username or email</span>
          <input value={identifier} onChange={(e) => setId(e.target.value)} />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        {err && <div style={{ color: "var(--bad)", marginBottom: 8 }}>{err}</div>}
        <button className="btn full" type="submit">
          Sign in
        </button>
        <p className="muted" style={{ marginTop: 12 }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="muted" style={{ fontSize: 12 }}>
          Demo: <code>alex_guitar</code> / <code>password</code> (after seeding)
        </p>
      </form>
    </div>
  );
}
