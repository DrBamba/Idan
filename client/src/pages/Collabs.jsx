import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Collabs() {
  const [collabs, setCollabs] = useState([]);
  const [filters, setFilters] = useState({ q: "", instrument: "", mode: "" });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    mode: "open",
    lookingFor: "",
    bpm: "",
    key: "",
    genre: "",
    licenseNote: "",
  });
  const [audio, setAudio] = useState(null);

  async function load() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    const d = await api.get(`/collabs?${params}`);
    setCollabs(d.collabs);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!audio) return alert("Upload your base track");
    const fd = new FormData();
    fd.append("audio", audio);
    Object.entries(form).forEach(([k, v]) => {
      if (k === "lookingFor") {
        fd.append(
          k,
          JSON.stringify(
            v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        );
      } else {
        fd.append(k, v);
      }
    });
    await api.postForm("/collabs", fd);
    setCreating(false);
    setForm({ ...form, title: "", description: "" });
    setAudio(null);
    load();
  }

  return (
    <>
      <h1 className="page-title">Collabs</h1>
      <div className="banner">
        <strong>Find a collaborator.</strong>{" "}
        <span className="muted">
          Wrote a song and need a sax solo? Looking for a guitar to lay down
          over your beat? Open a collab — others can record on top and submit
          stems. You decide what to keep.
        </span>
      </div>

      <div className="card row" style={{ flexWrap: "wrap" }}>
        <input
          placeholder="Search…"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <input
          placeholder="Instrument needed"
          value={filters.instrument}
          onChange={(e) =>
            setFilters({ ...filters, instrument: e.target.value })
          }
        />
        <select
          value={filters.mode}
          onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
        >
          <option value="">All modes</option>
          <option value="open">Open submissions</option>
          <option value="invite">Invite-approve only</option>
        </select>
        <button className="btn" onClick={load}>
          Filter
        </button>
        <button className="btn ghost" onClick={() => setCreating(!creating)}>
          {creating ? "Cancel" : "+ Open a collab"}
        </button>
      </div>

      {creating && (
        <form className="card" onSubmit={create}>
          <label>
            <span>Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            <span>Description — what you're after</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="grid-2">
            <label>
              <span>Mode</span>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option value="open">Open — submissions auto-approved</option>
                <option value="invite">Invite — I approve each track</option>
              </select>
            </label>
            <label>
              <span>Looking for (instruments, comma sep.)</span>
              <input
                value={form.lookingFor}
                onChange={(e) =>
                  setForm({ ...form, lookingFor: e.target.value })
                }
              />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span>BPM</span>
              <input
                type="number"
                value={form.bpm}
                onChange={(e) => setForm({ ...form, bpm: e.target.value })}
              />
            </label>
            <label>
              <span>Key</span>
              <input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
              />
            </label>
          </div>
          <label>
            <span>Genre</span>
            <input
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
            />
          </label>
          <label>
            <span>Rights / license note</span>
            <textarea
              rows={2}
              placeholder="e.g. 50/50 split if released, credit + 30% of streaming, etc."
              value={form.licenseNote}
              onChange={(e) =>
                setForm({ ...form, licenseNote: e.target.value })
              }
            />
          </label>
          <label>
            <span>Base track (audio)</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudio(e.target.files[0])}
            />
          </label>
          <button className="btn">Publish collab</button>
        </form>
      )}

      <div className="grid-cards">
        {collabs.map((c) => (
          <Link to={`/collabs/${c.id}`} key={c.id} className="card">
            <div className="row">
              <h3 style={{ margin: 0 }}>{c.title}</h3>
              <div className="spacer" />
              <span className="tag accent">{c.mode}</span>
            </div>
            <div className="muted" style={{ fontSize: 13, margin: "6px 0" }}>
              by {c.owner?.displayName} · {c.tracks.length} contributions
            </div>
            <p style={{ fontSize: 14 }}>{c.description}</p>
            <div>
              {(c.lookingFor || []).map((i) => (
                <span key={i} className="tag">
                  needs: {i}
                </span>
              ))}
              {c.bpm && <span className="tag">{c.bpm} bpm</span>}
              {c.key && <span className="tag">{c.key}</span>}
              {c.genre && <span className="tag">{c.genre}</span>}
            </div>
          </Link>
        ))}
        {collabs.length === 0 && <div className="muted">No collabs yet.</div>}
      </div>
    </>
  );
}
