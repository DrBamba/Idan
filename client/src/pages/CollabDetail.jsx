import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import Avatar from "../components/Avatar.jsx";

export default function CollabDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [collab, setCollab] = useState(null);
  const [audio, setAudio] = useState(null);
  const [instrument, setInstrument] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    const d = await api.get(`/collabs/${id}`);
    setCollab(d.collab);
  }
  useEffect(() => {
    load();
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    if (!audio) return;
    const fd = new FormData();
    fd.append("audio", audio);
    fd.append("instrument", instrument);
    fd.append("note", note);
    await api.postForm(`/collabs/${id}/tracks`, fd);
    setAudio(null);
    setInstrument("");
    setNote("");
    e.target.reset();
    load();
  }

  async function approve(trackId) {
    await api.post(`/collabs/${id}/tracks/${trackId}/approve`);
    load();
  }
  async function reject(trackId) {
    await api.post(`/collabs/${id}/tracks/${trackId}/reject`);
    load();
  }

  if (!collab) return <div className="muted">Loading…</div>;
  const isOwner = user?.id === collab.owner?.id;
  const visibleTracks = collab.tracks.filter(
    (t) => t.status === "approved" || isOwner,
  );

  return (
    <>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>{collab.title}</h1>
        <div className="row">
          <Avatar user={collab.owner} />
          <div>
            <Link
              to={`/u/${collab.owner?.username}`}
              style={{ fontWeight: 600 }}
            >
              {collab.owner?.displayName}
            </Link>
            <div className="muted" style={{ fontSize: 12 }}>
              opened {new Date(collab.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="spacer" />
          <span className="tag accent">{collab.mode}</span>
        </div>
        <p>{collab.description}</p>
        <div>
          {(collab.lookingFor || []).map((i) => (
            <span key={i} className="tag">
              needs: {i}
            </span>
          ))}
          {collab.bpm && <span className="tag">{collab.bpm} bpm</span>}
          {collab.key && <span className="tag">{collab.key}</span>}
          {collab.genre && <span className="tag">{collab.genre}</span>}
        </div>
        {collab.baseTrackUrl && (
          <>
            <h3>Base track</h3>
            <audio src={collab.baseTrackUrl} controls style={{ width: "100%" }} />
          </>
        )}
        {collab.licenseNote && (
          <p className="muted" style={{ marginTop: 8 }}>
            <strong>License:</strong> {collab.licenseNote}
          </p>
        )}
      </div>

      <h3>Contributions ({visibleTracks.length})</h3>
      {visibleTracks.length === 0 && (
        <div className="muted">No contributions yet — be the first.</div>
      )}
      {visibleTracks.map((t) => (
        <div className="card" key={t.id}>
          <div className="row">
            <Avatar user={t.contributor} />
            <div style={{ flex: 1 }}>
              <Link
                to={`/u/${t.contributor?.username}`}
                style={{ fontWeight: 600 }}
              >
                {t.contributor?.displayName}
              </Link>
              <div className="muted" style={{ fontSize: 12 }}>
                {t.instrument} · {new Date(t.createdAt).toLocaleString()}
              </div>
            </div>
            <span
              className="tag"
              style={{
                color:
                  t.status === "approved"
                    ? "var(--good)"
                    : t.status === "rejected"
                      ? "var(--bad)"
                      : "var(--accent-2)",
              }}
            >
              {t.status}
            </span>
          </div>
          {t.note && <p style={{ marginTop: 6 }}>{t.note}</p>}
          <audio src={t.audioUrl} controls style={{ width: "100%" }} />
          {isOwner && t.status === "pending" && (
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn tiny" onClick={() => approve(t.id)}>
                Approve & add to project
              </button>
              <button
                className="btn ghost tiny"
                onClick={() => reject(t.id)}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      {!isOwner && (
        <form className="card" onSubmit={submit}>
          <h3>Submit a contribution</h3>
          <p className="muted" style={{ marginTop: -6 }}>
            {collab.mode === "open"
              ? "This collab is open — your stem will be added to the project."
              : "The owner approves each submission before it joins the project."}
          </p>
          <label>
            <span>Instrument</span>
            <input
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              placeholder="e.g. saxophone"
            />
          </label>
          <label>
            <span>Note for the owner</span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <label>
            <span>Audio stem</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudio(e.target.files[0])}
            />
          </label>
          <button className="btn">Submit stem</button>
        </form>
      )}
    </>
  );
}
