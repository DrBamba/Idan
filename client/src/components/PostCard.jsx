import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "./Avatar.jsx";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");

  async function toggleLike() {
    const d = await api.post(`/posts/${post.id}/like`);
    setLiked(d.liked);
    setLikes(likes + (d.liked ? 1 : -1));
  }

  async function loadComments() {
    if (comments) return setComments(null);
    const d = await api.get(`/posts/${post.id}/comments`);
    setComments(d.comments);
  }

  async function addComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const d = await api.post(`/posts/${post.id}/comments`, { text });
    setComments([...(comments || []), d.comment]);
    setText("");
  }

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 10 }}>
        <Avatar user={post.author} />
        <div>
          <Link to={`/u/${post.author?.username}`} style={{ fontWeight: 600 }}>
            {post.author?.displayName}
          </Link>
          <div className="muted" style={{ fontSize: 12 }}>
            @{post.author?.username} · {post.author?.accountType}
          </div>
        </div>
      </div>
      {post.mediaUrl ? (
        post.mediaType === "video" ? (
          <video className="post-media" src={post.mediaUrl} controls />
        ) : post.mediaType === "audio" ? (
          <audio
            style={{ width: "100%", marginBottom: 8 }}
            src={post.mediaUrl}
            controls
          />
        ) : (
          <img className="post-media" src={post.mediaUrl} alt="" />
        )
      ) : (
        <div className="post-media placeholder">no media</div>
      )}
      {post.caption && <div style={{ marginBottom: 6 }}>{post.caption}</div>}
      <div className="row">
        <button className="btn ghost tiny" onClick={toggleLike}>
          {liked ? "♥" : "♡"} {likes}
        </button>
        <button className="btn ghost tiny" onClick={loadComments}>
          💬 {post.commentCount || 0}
        </button>
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 12 }}>
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
      {comments && (
        <div style={{ marginTop: 10 }}>
          {comments.map((c) => (
            <div key={c.id} className="row" style={{ marginBottom: 6 }}>
              <Avatar user={c.author} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {c.author?.displayName}
                </div>
                <div style={{ fontSize: 14 }}>{c.text}</div>
              </div>
            </div>
          ))}
          <form onSubmit={addComment} className="row" style={{ marginTop: 8 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
            />
            <button className="btn tiny" type="submit">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
