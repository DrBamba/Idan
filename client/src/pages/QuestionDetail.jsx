import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function QuestionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [text, setText] = useState("");

  async function load() {
    setData(await api.get(`/questions/${id}`));
  }
  useEffect(() => {
    load();
  }, [id]);

  async function answer(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/questions/${id}/answers`, { text });
    setText("");
    load();
  }

  async function upvote(answerId) {
    await api.post(`/questions/answers/${answerId}/upvote`);
    load();
  }

  if (!data) return <div className="muted">Loading…</div>;
  const q = data.question;
  return (
    <>
      <div className="card">
        <h1 style={{ margin: 0 }}>{q.title}</h1>
        <div className="row" style={{ marginTop: 8 }}>
          <Avatar user={q.author} />
          <div>
            <div style={{ fontWeight: 600 }}>{q.author?.displayName}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {new Date(q.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <p style={{ marginTop: 12 }}>{q.body}</p>
        <div>
          {(q.tags || []).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      <h3>{data.answers.length} answers</h3>
      {data.answers.map((a) => (
        <div key={a.id} className="card">
          <div className="row">
            <Avatar user={a.author} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{a.author?.displayName}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              className="btn ghost tiny"
              onClick={() => upvote(a.id)}
            >
              ▲ {a.upvotes || 0}
            </button>
          </div>
          <p style={{ marginTop: 8 }}>{a.text}</p>
        </div>
      ))}

      <form className="card" onSubmit={answer}>
        <h3>Your answer</h3>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn">Post answer</button>
      </form>
    </>
  );
}
