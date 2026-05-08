import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    displayName: user.displayName || "",
    bio: user.bio || "",
    location: user.location || "",
    instruments: (user.instruments || []).join(", "),
    genres: (user.genres || []).join(", "),
    isPrivate: user.isPrivate || false,
  });
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("displayName", form.displayName);
      fd.append("bio", form.bio);
      fd.append("location", form.location);
      fd.append("isPrivate", form.isPrivate ? "true" : "false");
      fd.append(
        "instruments",
        JSON.stringify(
          form.instruments
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      );
      fd.append(
        "genres",
        JSON.stringify(
          form.genres
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      );
      if (avatar) fd.append("avatar", avatar);
      const d = await api.putForm("/users/me", fd);
      setUser(d.user);
      nav(`/u/${d.user.username}`);
    } finally {
      setBusy(false);
    }
  }

  async function connectSpotify() {
    const d = await api.post("/playlists/spotify/connect");
    setUser(d.user);
    alert("Spotify connected (mock).");
  }

  return (
    <>
      <h1 className="page-title">Edit profile</h1>
      <form className="card" onSubmit={save}>
        <label>
          <span>Display name</span>
          <input
            value={form.displayName}
            onChange={(e) => set("displayName", e.target.value)}
          />
        </label>
        <label>
          <span>Bio</span>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </label>
        <label>
          <span>Location</span>
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </label>
        <label>
          <span>Instruments (comma separated)</span>
          <input
            value={form.instruments}
            onChange={(e) => set("instruments", e.target.value)}
          />
        </label>
        <label>
          <span>Genres (comma separated)</span>
          <input
            value={form.genres}
            onChange={(e) => set("genres", e.target.value)}
          />
        </label>
        <label>
          <span>Avatar</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </label>
        <label className="row" style={{ alignItems: "center" }}>
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={form.isPrivate}
            onChange={(e) => set("isPrivate", e.target.checked)}
          />
          <span style={{ marginBottom: 0 }}>Private account</span>
        </label>
        <button className="btn" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </form>

      <div className="card">
        <h3>Spotify</h3>
        {user.spotifyConnected ? (
          <p className="muted">✓ Connected — your playlists can link to Spotify.</p>
        ) : (
          <>
            <p className="muted">
              Connect Spotify to share your playlists from your profile.
            </p>
            <button className="btn" onClick={connectSpotify}>
              Connect Spotify (mock)
            </button>
          </>
        )}
      </div>
    </>
  );
}
