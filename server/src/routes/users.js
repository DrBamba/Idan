import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, optionalAuth, publicUser } from "../auth.js";
import { upload, fileUrl } from "../upload.js";

const router = Router();

router.get("/search", optionalAuth, (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  const type = req.query.type;
  let users = db.get("users");
  if (q) {
    users = users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.displayName || "").toLowerCase().includes(q) ||
        (u.instruments || []).some((i) => i.toLowerCase().includes(q)) ||
        (u.genres || []).some((g) => g.toLowerCase().includes(q)),
    );
  }
  if (type) users = users.filter((u) => u.accountType === type);
  res.json({ users: users.slice(0, 50).map(publicUser) });
});

router.get("/:username", optionalAuth, (req, res) => {
  const user = db.find("users", (u) => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: "not found" });
  const followers = db.filter("follows", (f) => f.followingId === user.id);
  const following = db.filter("follows", (f) => f.followerId === user.id);
  const isFollowing = req.user
    ? !!db.find(
        "follows",
        (f) => f.followerId === req.user.id && f.followingId === user.id,
      )
    : false;
  res.json({
    user: publicUser(user),
    counts: { followers: followers.length, following: following.length },
    isFollowing,
    isSelf: req.user?.id === user.id,
  });
});

router.put("/me", requireAuth, upload.single("avatar"), (req, res) => {
  const updates = {};
  const fields = ["displayName", "bio", "location", "isPrivate"];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (req.body.instruments)
    updates.instruments = JSON.parse(req.body.instruments);
  if (req.body.genres) updates.genres = JSON.parse(req.body.genres);
  if (typeof updates.isPrivate === "string")
    updates.isPrivate = updates.isPrivate === "true";
  if (req.file) updates.avatarUrl = fileUrl(req.file.filename);
  const updated = db.update("users", req.user.id, updates);
  res.json({ user: publicUser(updated) });
});

router.post("/:id/follow", requireAuth, (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: "cannot follow self" });
  const target = db.find("users", (u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "not found" });
  const existing = db.find(
    "follows",
    (f) => f.followerId === req.user.id && f.followingId === target.id,
  );
  if (existing) {
    db.remove(
      "follows",
      (f) => f.followerId === req.user.id && f.followingId === target.id,
    );
    return res.json({ following: false });
  }
  db.insert("follows", {
    followerId: req.user.id,
    followingId: target.id,
    createdAt: Date.now(),
  });
  res.json({ following: true });
});

router.get("/:id/followers", (req, res) => {
  const rows = db.filter("follows", (f) => f.followingId === req.params.id);
  const ids = new Set(rows.map((r) => r.followerId));
  const users = db.filter("users", (u) => ids.has(u.id)).map(publicUser);
  res.json({ users });
});

router.get("/:id/following", (req, res) => {
  const rows = db.filter("follows", (f) => f.followerId === req.params.id);
  const ids = new Set(rows.map((r) => r.followingId));
  const users = db.filter("users", (u) => ids.has(u.id)).map(publicUser);
  res.json({ users });
});

export default router;
