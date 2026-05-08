import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function TeacherDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  async function load() {
    setData(await api.get(`/teachers/${id}`));
  }
  useEffect(() => {
    load();
  }, [id]);

  async function review(e) {
    e.preventDefault();
    await api.post(`/teachers/${id}/reviews`, { rating, text });
    setText("");
    load();
  }

  if (!data) return <div className="muted">Loading…</div>;
  const t = data.teacher;
  return (
    <>
      <div className="profile-header">
        <Avatar user={t.user} size="lg" />
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            {t.user?.displayName}
          </h1>
          <div className="muted">
            {t.city}, {t.country}
          </div>
          <div className="row" style={{ marginTop: 4 }}>
            <span className="stars">
              {"★".repeat(Math.round(t.avgRating))}
            </span>
            <span className="muted">
              {t.avgRating || "no reviews"} ({t.reviewCount} reviews)
            </span>
          </div>
          <p>{t.headline}</p>
          <p className="muted">{t.bio}</p>
          <div>
            {(t.instruments || []).map((i) => (
              <span key={i} className="tag">
                {i}
              </span>
            ))}
            {(t.languages || []).map((l) => (
              <span key={l} className="tag">
                {l}
              </span>
            ))}
            {t.online && <span className="tag">online</span>}
            {t.inPerson && <span className="tag">in-person</span>}
            <span className="tag accent">
              {t.pricePerHour ? `${t.pricePerHour}/hr` : "rate on request"}
            </span>
          </div>
        </div>
        <Link className="btn" to={`/messages/${t.user?.id}`}>
          Message teacher
        </Link>
      </div>

      <h3>Reviews</h3>
      {data.reviews.length === 0 && <div className="muted">No reviews yet.</div>}
      {data.reviews.map((r) => (
        <div key={r.id} className="card">
          <div className="row">
            <Avatar user={r.author} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{r.author?.displayName}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className="stars">{"★".repeat(r.rating)}</span>
          </div>
          <p>{r.text}</p>
        </div>
      ))}

      <form className="card" onSubmit={review}>
        <h3>Leave a review</h3>
        <label>
          <span>Rating</span>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Comment</span>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button className="btn">Submit review</button>
      </form>
    </>
  );
}
