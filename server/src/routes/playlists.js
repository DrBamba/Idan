import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, publicUser } from "../auth.js";

const router = Router();

router.get("/user/:userId", (req, res) => {
  const playlists = db.filter("playlists", (p) => p.userId === req.params.userId);
  res.json({ playlists });
});

router.post("/", requireAuth, (req, res) => {
  const { title, description = "", spotifyId, coverUrl, tracks = [] } = req.body || {};
  if (!title) return res.status(400).json({ error: "title required" });
  const playlist = {
    id: nanoid(),
    userId: req.user.id,
    title,
    description,
    spotifyId: spotifyId || null,
    spotifyUrl: spotifyId
      ? `https://open.spotify.com/playlist/${spotifyId}`
      : null,
    coverUrl: coverUrl || null,
    tracks,
    createdAt: Date.now(),
  };
  db.insert("playlists", playlist);
  res.json({ playlist });
});

router.delete("/:id", requireAuth, (req, res) => {
  const pl = db.find("playlists", (p) => p.id === req.params.id);
  if (!pl) return res.status(404).json({ error: "not found" });
  if (pl.userId !== req.user.id)
    return res.status(403).json({ error: "forbidden" });
  db.remove("playlists", (p) => p.id === pl.id);
  res.json({ ok: true });
});

// Mock Spotify "connect" — in production this would go through OAuth
router.post("/spotify/connect", requireAuth, (req, res) => {
  db.update("users", req.user.id, { spotifyConnected: true });
  res.json({ user: publicUser(db.find("users", (u) => u.id === req.user.id)) });
});

export default router;
