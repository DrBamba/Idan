import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, publicUser } from "../auth.js";

const router = Router();

function hydrate(teacher) {
  const user = db.find("users", (u) => u.id === teacher.userId);
  const reviews = db.filter("reviews", (r) => r.teacherId === teacher.id);
  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    ...teacher,
    user: publicUser(user),
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  };
}

router.get("/", (req, res) => {
  const { q, instrument, location } = req.query;
  let teachers = db.get("teacherProfiles").map(hydrate);
  if (q) {
    const ql = q.toString().toLowerCase();
    teachers = teachers.filter(
      (t) =>
        (t.user?.displayName || "").toLowerCase().includes(ql) ||
        (t.headline || "").toLowerCase().includes(ql),
    );
  }
  if (instrument) {
    const il = instrument.toString().toLowerCase();
    teachers = teachers.filter((t) =>
      (t.instruments || []).some((i) => i.toLowerCase().includes(il)),
    );
  }
  if (location) {
    const ll = location.toString().toLowerCase();
    teachers = teachers.filter((t) =>
      (t.city || "").toLowerCase().includes(ll) ||
      (t.country || "").toLowerCase().includes(ll),
    );
  }
  teachers.sort((a, b) => b.avgRating - a.avgRating);
  res.json({ teachers });
});

router.get("/:id", (req, res) => {
  const teacher = db.find("teacherProfiles", (t) => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: "not found" });
  const reviews = db
    .filter("reviews", (r) => r.teacherId === teacher.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((r) => ({
      ...r,
      author: publicUser(db.find("users", (u) => u.id === r.userId)),
    }));
  res.json({ teacher: hydrate(teacher), reviews });
});

router.post("/", requireAuth, (req, res) => {
  if (req.user.accountType !== "teacher") {
    return res.status(403).json({ error: "only teacher accounts" });
  }
  const existing = db.find("teacherProfiles", (t) => t.userId === req.user.id);
  if (existing) return res.status(409).json({ error: "profile exists" });
  const {
    headline = "",
    bio = "",
    instruments = [],
    city = "",
    country = "",
    pricePerHour = 0,
    languages = [],
    online = true,
    inPerson = true,
  } = req.body || {};
  const teacher = {
    id: nanoid(),
    userId: req.user.id,
    headline,
    bio,
    instruments,
    city,
    country,
    pricePerHour: Number(pricePerHour) || 0,
    languages,
    online: !!online,
    inPerson: !!inPerson,
    createdAt: Date.now(),
  };
  db.insert("teacherProfiles", teacher);
  res.json({ teacher: hydrate(teacher) });
});

router.put("/:id", requireAuth, (req, res) => {
  const teacher = db.find("teacherProfiles", (t) => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: "not found" });
  if (teacher.userId !== req.user.id)
    return res.status(403).json({ error: "forbidden" });
  const updates = { ...req.body };
  if (updates.pricePerHour !== undefined)
    updates.pricePerHour = Number(updates.pricePerHour) || 0;
  const updated = db.update("teacherProfiles", teacher.id, updates);
  res.json({ teacher: hydrate(updated) });
});

router.post("/:id/reviews", requireAuth, (req, res) => {
  const teacher = db.find("teacherProfiles", (t) => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: "not found" });
  const { rating, text = "" } = req.body || {};
  const r = Number(rating);
  if (!(r >= 1 && r <= 5)) return res.status(400).json({ error: "rating 1-5" });
  const review = {
    id: nanoid(),
    teacherId: teacher.id,
    userId: req.user.id,
    rating: r,
    text,
    createdAt: Date.now(),
  };
  db.insert("reviews", review);
  res.json({
    review: { ...review, author: publicUser(req.user) },
    teacher: hydrate(teacher),
  });
});

export default router;
