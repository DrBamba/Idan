import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import Avatar from "./Avatar.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">♪ Harmonia</div>
        <nav className="nav">
          <NavLink to="/" end>
            Feed
          </NavLink>
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/teachers">Teachers</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/marketplace">Marketplace</NavLink>
          <NavLink to="/collabs">Collabs</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          {user && (
            <NavLink to={`/u/${user.username}`}>My profile</NavLink>
          )}
        </nav>
        <div style={{ marginTop: 24 }}>
          {user ? (
            <div>
              <div className="row" style={{ marginBottom: 8 }}>
                <Avatar user={user} />
                <div>
                  <div style={{ fontWeight: 600 }}>{user.displayName}</div>
                  <div className="muted">@{user.username}</div>
                </div>
              </div>
              <button
                className="btn ghost full"
                onClick={() => {
                  logout();
                  nav("/login");
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button className="btn full" onClick={() => nav("/login")}>
              Sign in
            </button>
          )}
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
