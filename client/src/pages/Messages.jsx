import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import Avatar from "../components/Avatar.jsx";

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  async function loadThreads() {
    const d = await api.get("/messages/threads");
    setThreads(d.threads);
  }
  async function loadThread(id) {
    const d = await api.get(`/messages/with/${id}`);
    setThread(d);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }
  useEffect(() => {
    loadThreads();
  }, []);
  useEffect(() => {
    if (userId) loadThread(userId);
  }, [userId]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !userId) return;
    await api.post(`/messages/with/${userId}`, { text });
    setText("");
    loadThread(userId);
    loadThreads();
  }

  return (
    <>
      <h1 className="page-title">Messages</h1>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 8 }}>
          {threads.length === 0 && (
            <div className="muted" style={{ padding: 12 }}>
              No conversations yet.
            </div>
          )}
          {threads.map((t) => (
            <Link
              to={`/messages/${t.otherId}`}
              key={t.otherId}
              className="row"
              style={{
                padding: 8,
                borderRadius: 8,
                background:
                  userId === t.otherId ? "var(--panel-2)" : "transparent",
              }}
            >
              <Avatar user={t.other} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 600 }}>{t.other?.displayName}</div>
                <div
                  className="muted"
                  style={{
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.text}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="card">
          {!userId || !thread ? (
            <div className="muted">Pick a conversation, or message someone from their profile.</div>
          ) : (
            <>
              <div className="row" style={{ marginBottom: 12 }}>
                <Avatar user={thread.other} />
                <div>
                  <Link
                    to={`/u/${thread.other?.username}`}
                    style={{ fontWeight: 600 }}
                  >
                    {thread.other?.displayName}
                  </Link>
                  <div className="muted" style={{ fontSize: 12 }}>
                    @{thread.other?.username}
                  </div>
                </div>
              </div>
              <div className="msg-thread">
                {thread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={"msg" + (m.fromId === user.id ? " me" : "")}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form className="row" onSubmit={send} style={{ marginTop: 8 }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                />
                <button className="btn">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
