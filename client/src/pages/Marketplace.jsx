import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

const CATEGORIES = [
  "guitar",
  "bass",
  "drums",
  "keys",
  "synth",
  "amp",
  "pedal",
  "microphone",
  "interface",
  "vinyl",
  "sheet_music",
  "other",
];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    mode: "",
    location: "",
  });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "guitar",
    mode: "sale",
    price: 0,
    currency: "ILS",
    condition: "used",
    location: "",
    forTrade: "",
  });
  const [photos, setPhotos] = useState([]);

  async function load() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    const d = await api.get(`/marketplace?${params}`);
    setListings(d.listings);
  }
  useEffect(() => {
    load();
  }, []);

  async function createListing(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    photos.forEach((p) => fd.append("photos", p));
    await api.postForm("/marketplace", fd);
    setCreating(false);
    setForm({ ...form, title: "", description: "" });
    setPhotos([]);
    load();
  }

  return (
    <>
      <h1 className="page-title">Marketplace</h1>
      <div className="banner">
        <strong>Buy, sell, rent or trade music gear.</strong>{" "}
        <span className="muted">
          From a signed vinyl to a vintage SM7B — keep it musical.
        </span>
      </div>

      <div className="card row" style={{ flexWrap: "wrap" }}>
        <input
          placeholder="Search…"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.mode}
          onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
        >
          <option value="">All modes</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
          <option value="trade">For trade</option>
        </select>
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) =>
            setFilters({ ...filters, location: e.target.value })
          }
        />
        <button className="btn" onClick={load}>
          Filter
        </button>
        <button className="btn ghost" onClick={() => setCreating(!creating)}>
          {creating ? "Cancel" : "+ List item"}
        </button>
      </div>

      {creating && (
        <form className="card" onSubmit={createListing}>
          <label>
            <span>Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            <span>Description</span>
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
              <span>Category</span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Mode</span>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
                <option value="trade">For trade</option>
              </select>
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span>Price</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label>
              <span>Currency</span>
              <input
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
              />
            </label>
          </div>
          <label>
            <span>Location</span>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          {form.mode === "trade" && (
            <label>
              <span>Looking to trade for</span>
              <input
                value={form.forTrade}
                onChange={(e) =>
                  setForm({ ...form, forTrade: e.target.value })
                }
              />
            </label>
          )}
          <label>
            <span>Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos([...e.target.files])}
            />
          </label>
          <button className="btn">Publish</button>
        </form>
      )}

      <div className="grid-cards">
        {listings.map((l) => (
          <Link to={`/marketplace/${l.id}`} key={l.id} className="card">
            {l.photos?.[0] && (
              <img
                src={l.photos[0]}
                alt=""
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}
            <h3 style={{ margin: 0 }}>{l.title}</h3>
            <div className="row" style={{ marginTop: 6 }}>
              <span className="tag">{l.category}</span>
              <span className="tag accent">{l.mode}</span>
              {l.price > 0 && (
                <span className="tag">
                  {l.price} {l.currency}
                </span>
              )}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              {l.location} · @{l.seller?.username}
            </div>
          </Link>
        ))}
        {listings.length === 0 && <div className="muted">No listings yet.</div>}
      </div>
    </>
  );
}
