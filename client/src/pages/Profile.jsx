import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import Avatar from "../components/Avatar.jsx";
import PostCard from "../components/PostCard.jsx";

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tab, setTab] = useState("posts");

  async function load() {
    const u = await api.get(`/users/${username}`);
    setData(u);
    const p = await api.get(`/posts/user/${username}`);
    setPosts(p.posts);
    const pl = await api.get(`/playlists/user/${u.user.id}`);
    setPlaylists(pl.playlists);
  }

  useEffect(() => {
    load();
  }, [username]);

  async function follow() {
    await api.post(`/users/${data.user.id}/follow`);
    load();
  }

  async function addPlaylist() {
    const title = prompt("Playlist title:");
    if (!title) return;
    const spotifyId = prompt("Spotify playlist ID (optional):") || "";
    await api.post("/playlists", { title, spotifyId });
    load();
  }

  if (!data) return <div className="muted">Loading…</div>;
  const u = data.user;
  return (
    <>
      <div className="profile-header">
        <Avatar user={u} size="lg" />
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            {u.displayName}{" "}
            <span className="tag accent">{u.accountType}</span>
          </h1>
          <div className="muted">@{u.username}</div>
          {u.location && <div className="muted">📍 {u.location}</div>}
          <div style={{ marginTop: 8 }}>
            <span className="tag">
              {data.counts.followers} followers
            </span>
            <span className="tag">{data.counts.following} following</span>
          </div>
          {u.bio && <p style={{ marginTop: 8 }}>{u.bio}</p>}
          <div style={{ marginTop: 6 }}>
            {(u.instruments || []).map((i) => (
              <span key={i} className="tag">
                {i}
              </span>
            ))}
            {(u.genres || []).map((g) => (
              <span key={g} className="tag">
                {g}
              </span>
            ))}
          </div>
        </div>
        <div>
          {data.isSelf ? (
            <button
              className="btn ghost"
              onClick={() => nav("/settings/profile")}
            >
              Edit profile
            </button>
          ) : (
            <>
              <button className="btn" onClick={follow}>
                {data.isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button
                className="btn ghost"
                style={{ marginLeft: 6 }}
                onClick={() => nav(`/messages/${u.id}`)}
              >
                Message
              </button>
            </>
          )}
        </div>
      </div>

      <div className="tabs">
        <div
          className={"tab" + (tab === "posts" ? " active" : "")}
          onClick={() => setTab("posts")}
        >
          Posts ({posts.length})
        </div>
        <div
          className={"tab" + (tab === "playlists" ? " active" : "")}
          onClick={() => setTab("playlists")}
        >
          Playlists ({playlists.length})
        </div>
      </div>

      {tab === "posts" &&
        (posts.length === 0 ? (
          <div className="muted">No posts yet.</div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ))}

      {tab === "playlists" && (
        <>
          {data.isSelf && (
            <button className="btn" onClick={addPlaylist}>
              + Add playlist
            </button>
          )}
          <div className="grid-cards" style={{ marginTop: 12 }}>
            {playlists.map((p) => (
              <div key={p.id} className="card">
                <h3 style={{ margin: 0 }}>{p.title}</h3>
                <div className="muted" style={{ fontSize: 13 }}>
                  {p.description}
                </div>
                {p.spotifyUrl && (
                  <p style={{ marginTop: 8 }}>
                    <a href={p.spotifyUrl} target="_blank" rel="noreferrer">
                      Open on Spotify ↗
                    </a>
                  </p>
                )}
              </div>
            ))}
            {playlists.length === 0 && (
              <div className="muted">No playlists yet.</div>
            )}
          </div>
        </>
      )}
    </>
  );
}
