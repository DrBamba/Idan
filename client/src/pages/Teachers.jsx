import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";
import { useAuth } from "../auth.jsx";

export default function Teachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [q, setQ] = useState("");
  const [instrument, setInstrument] = useState("");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    instruments: "",
    city: "",
    country: "Israel",
    pricePerHour: 0,
    languages: "Hebrew, English",
    online: true,
    inPerson: true,
  });

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (instrument) params.set("instrument", instrument);
    if (location) params.set("location", location);
    const d = await api.get(`/teachers?${params}`);
    setTeachers(d.teachers);
  }

  useEffect(() => {
    load();
  }, []);

  async function createProfile(e) {
    e.preventDefault();
    await api.post("/teachers", {
      ...form,
      instruments: form.instruments.split(",").map((s) => s.trim()).filter(Boolean),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setCreating(false);
    load();
  }

  return (
    <>
      <h1 className="page-title">Find a music teacher</h1>
      <div className="banner">
        <strong>Lessons near you.</strong>{" "}
        <span className="muted">
          Search by instrument or city, read reviews, and contact teachers
          directly.
        </span>
      </div>
      <div className="card">
        <div className="row">
          <input
            placeholder="Name or headline"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <input
            placeholder="Instrument"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          />
          <input
            placeholder="City / country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button className="btn" onClick={load}>
            Search
          </button>
        </div>
      </div>

      {user?.accountType === "teacher" && (
        <div className="card">
          {creating ? (
            <form onSubmit={createProfile}>
              <h3>Create teacher profile</h3>
              <label>
                <span>Headline</span>
                <input
                  value={form.headline}
                  onChange={(e) =>
                    setForm({ ...form, headline: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Bio</span>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </label>
              <label>
                <span>Instruments (comma separated)</span>
                <input
                  value={form.instruments}
                  onChange={(e) =>
                    setForm({ ...form, instruments: e.target.value })
                  }
                />
              </label>
              <div className="grid-2">
                <label>
                  <span>City</span>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </label>
                <label>
                  <span>Country</span>
                  <input
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                <span>Price per hour</span>
                <input
                  type="number"
                  value={form.pricePerHour}
                  onChange={(e) =>
                    setForm({ ...form, pricePerHour: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Languages (comma separated)</span>
                <input
                  value={form.languages}
                  onChange={(e) =>
                    setForm({ ...form, languages: e.target.value })
                  }
                />
              </label>
              <button className="btn">Save</button>
              <button
                className="btn ghost"
                style={{ marginLeft: 8 }}
                type="button"
                onClick={() => setCreating(false)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button className="btn" onClick={() => setCreating(true)}>
              + List myself as a teacher
            </button>
          )}
        </div>
      )}

      <div className="grid-cards">
        {teachers.map((t) => (
          <Link key={t.id} to={`/teachers/${t.id}`} className="card">
            <div className="row">
              <Avatar user={t.user} />
              <div>
                <div style={{ fontWeight: 600 }}>{t.user?.displayName}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {t.city}, {t.country}
                </div>
              </div>
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              {t.headline}
            </p>
            <div className="row">
              <span className="stars">{"★".repeat(Math.round(t.avgRating))}</span>
              <span className="muted" style={{ fontSize: 12 }}>
                {t.avgRating || "no reviews"} ({t.reviewCount})
              </span>
              <div className="spacer" />
              <span className="tag accent">
                {t.pricePerHour ? `${t.pricePerHour}/hr` : "rate on request"}
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              {(t.instruments || []).map((i) => (
                <span key={i} className="tag">
                  {i}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {teachers.length === 0 && <div className="muted">No teachers found.</div>}
      </div>
    </>
  );
}
