import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, optionalAuth, publicUser } from "../auth.js";
import { upload, fileUrl } from "../upload.js";

const router = Router();

function hydrate(l) {
  const seller = db.find("users", (u) => u.id === l.userId);
  return { ...l, seller: publicUser(seller) };
}

router.get("/", optionalAuth, (req, res) => {
  const { q, category, mode, location } = req.query;
  let listings = db.get("listings");
  if (q) {
    const ql = q.toString().toLowerCase();
    listings = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(ql) ||
        (l.description || "").toLowerCase().includes(ql),
    );
  }
  if (category) listings = listings.filter((l) => l.category === category);
  if (mode) listings = listings.filter((l) => l.mode === mode);
  if (location) {
    const ll = location.toString().toLowerCase();
    listings = listings.filter((l) =>
      (l.location || "").toLowerCase().includes(ll),
    );
  }
  listings = listings
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(hydrate);
  res.json({ listings });
});

router.get("/:id", optionalAuth, (req, res) => {
  const l = db.find("listings", (it) => it.id === req.params.id);
  if (!l) return res.status(404).json({ error: "not found" });
  res.json({ listing: hydrate(l) });
});

router.post(
  "/",
  requireAuth,
  upload.array("photos", 6),
  (req, res) => {
    const {
      title,
      description = "",
      category = "other",
      mode = "sale",
      price = 0,
      currency = "USD",
      condition = "used",
      location = "",
      forTrade = "",
    } = req.body || {};
    if (!title) return res.status(400).json({ error: "title required" });
    const photos = (req.files || []).map((f) => fileUrl(f.filename));
    const l = {
      id: nanoid(),
      userId: req.user.id,
      title,
      description,
      category,
      mode,
      price: Number(price) || 0,
      currency,
      condition,
      location,
      forTrade,
      photos,
      sold: false,
      createdAt: Date.now(),
    };
    db.insert("listings", l);
    res.json({ listing: hydrate(l) });
  },
);

router.put("/:id", requireAuth, (req, res) => {
  const l = db.find("listings", (it) => it.id === req.params.id);
  if (!l) return res.status(404).json({ error: "not found" });
  if (l.userId !== req.user.id)
    return res.status(403).json({ error: "forbidden" });
  const updates = { ...req.body };
  if (updates.price !== undefined) updates.price = Number(updates.price) || 0;
  const updated = db.update("listings", l.id, updates);
  res.json({ listing: hydrate(updated) });
});

router.delete("/:id", requireAuth, (req, res) => {
  const l = db.find("listings", (it) => it.id === req.params.id);
  if (!l) return res.status(404).json({ error: "not found" });
  if (l.userId !== req.user.id)
    return res.status(403).json({ error: "forbidden" });
  db.remove("listings", (it) => it.id === l.id);
  res.json({ ok: true });
});

export default router;
