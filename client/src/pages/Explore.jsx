import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import PostCard from "../components/PostCard.jsx";
import Avatar from "../components/Avatar.jsx";

export default function Explore() {
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    api.get("/posts/explore").then((d) => setPosts(d.posts));
  }, []);

  async function searchUsers() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    const d = await api.get(`/users/search?${params}`);
    setUsers(d.users);
  }

  useEffect(() => {
    if (tab === "people") searchUsers();
  }, [tab]);

  return (
    <>
      <h1 className="page-title">Explore</h1>
      <div className="tabs">
        <div
          className={"tab" + (tab === "posts" ? " active" : "")}
          onClick={() => setTab("posts")}
        >
          Posts
        </div>
        <div
          className={"tab" + (tab === "people" ? " active" : "")}
          onClick={() => setTab("people")}
        >
          People
        </div>
      </div>
      {tab === "posts" ? (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      ) : (
        <>
          <div className="card row">
            <input
              placeholder="Search by name, instrument, genre…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              <option value="musician">Musicians</option>
              <option value="producer">Producers</option>
              <option value="teacher">Teachers</option>
              <option value="business">Businesses</option>
              <option value="listener">Listeners</option>
            </select>
            <button className="btn" onClick={searchUsers}>
              Search
            </button>
          </div>
          <div className="grid-cards">
            {users.map((u) => (
              <Link to={`/u/${u.username}`} key={u.id} className="card">
                <div className="row">
                  <Avatar user={u} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      @{u.username} · {u.accountType}
                    </div>
                  </div>
                </div>
                {u.bio && (
                  <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                    {u.bio}
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  {(u.instruments || []).map((i) => (
                    <span key={i} className="tag">
                      {i}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
