import { useEffect, useState } from "react";
import { api } from "../api.js";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../auth.jsx";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await api.get("/posts/feed");
    setPosts(d.posts);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("media", file);
      fd.append("caption", caption);
      await api.postForm("/posts", fd);
      setCaption("");
      setFile(null);
      e.target.reset();
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Your feed</h1>
      <div className="banner">
        <strong>Welcome, {user?.displayName}.</strong>{" "}
        <span className="muted">
          Posts from people you follow, plus your own. Share clips, recordings,
          or shots from gigs.
        </span>
      </div>
      <div className="card">
        <h3>Share something</h3>
        <form onSubmit={submit}>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <textarea
            placeholder="Caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            style={{ marginTop: 8 }}
          />
          <button className="btn" type="submit" disabled={busy || !file}>
            {busy ? "Posting…" : "Post"}
          </button>
        </form>
      </div>
      {posts.length === 0 ? (
        <div className="card muted">
          Nothing yet — follow some musicians on the Explore page.
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </>
  );
}
