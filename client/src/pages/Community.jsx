import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function Community() {
  const [questions, setQuestions] = useState([]);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", tags: "" });

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const d = await api.get(`/questions?${params}`);
    setQuestions(d.questions);
  }
  useEffect(() => {
    load();
  }, []);

  async function ask(e) {
    e.preventDefault();
    await api.post("/questions", {
      title: form.title,
      body: form.body,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setForm({ title: "", body: "", tags: "" });
    setCreating(false);
    load();
  }

  return (
    <>
      <h1 className="page-title">Community Q&amp;A</h1>
      <div className="banner">
        <strong>Stuck on something?</strong>{" "}
        <span className="muted">
          Ask the community — gear problems, theory questions, "what's this
          riff?" — anything music-related.
        </span>
      </div>
      <div className="card row">
        <input
          placeholder="Search questions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn" onClick={load}>
          Search
        </button>
        <button
          className="btn ghost"
          onClick={() => setCreating(!creating)}
        >
          {creating ? "Cancel" : "Ask a question"}
        </button>
      </div>

      {creating && (
        <form className="card" onSubmit={ask}>
          <label>
            <span>Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            <span>Details</span>
            <textarea
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </label>
          <label>
            <span>Tags (comma separated, e.g. guitar, theory)</span>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </label>
          <button className="btn">Post question</button>
        </form>
      )}

      {questions.map((q) => (
        <Link to={`/community/${q.id}`} key={q.id} className="card">
          <h3 style={{ margin: 0 }}>{q.title}</h3>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            {(q.tags || []).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <Avatar user={q.author} />
            <div className="muted" style={{ fontSize: 13 }}>
              {q.author?.displayName} · {new Date(q.createdAt).toLocaleString()}
            </div>
            <div className="spacer" />
            <span className="tag accent">{q.answerCount} answers</span>
          </div>
        </Link>
      ))}
    </>
  );
}
