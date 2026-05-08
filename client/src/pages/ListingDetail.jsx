import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    api.get(`/marketplace/${id}`).then((d) => setListing(d.listing));
  }, [id]);

  if (!listing) return <div className="muted">Loading…</div>;
  return (
    <>
      <h1 className="page-title">{listing.title}</h1>
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <span className="tag">{listing.category}</span>
          <span className="tag accent">{listing.mode}</span>
          <span className="tag">{listing.condition}</span>
          {listing.price > 0 && (
            <span className="tag">
              {listing.price} {listing.currency}
            </span>
          )}
        </div>
        {listing.photos?.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {listing.photos.map((p) => (
              <img
                key={p}
                src={p}
                alt=""
                style={{
                  width: "100%",
                  borderRadius: 8,
                  objectFit: "cover",
                  height: 200,
                }}
              />
            ))}
          </div>
        )}
        <p>{listing.description}</p>
        {listing.forTrade && (
          <p className="muted">
            <strong>Trade for:</strong> {listing.forTrade}
          </p>
        )}
        <p className="muted">📍 {listing.location}</p>
      </div>

      <div className="card">
        <div className="row">
          <Avatar user={listing.seller} />
          <div style={{ flex: 1 }}>
            <Link
              to={`/u/${listing.seller?.username}`}
              style={{ fontWeight: 600 }}
            >
              {listing.seller?.displayName}
            </Link>
            <div className="muted" style={{ fontSize: 12 }}>
              @{listing.seller?.username}
            </div>
          </div>
          <Link className="btn" to={`/messages/${listing.seller?.id}`}>
            Contact seller
          </Link>
        </div>
      </div>
    </>
  );
}
