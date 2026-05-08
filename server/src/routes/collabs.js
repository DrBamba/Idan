import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, optionalAuth, publicUser } from "../auth.js";
import { upload, fileUrl } from "../upload.js";

const router = Router();

function hydrate(c) {
  const owner = db.find("users", (u) => u.id === c.userId);
  const tracks = db
    .filter("collabTracks", (t) => t.collabId === c.id)
    .map((t) => ({
      ...t,
      contributor: publicUser(db.find("users", (u) => u.id === t.contributorId)),
    }))
    .sort((a, b) => a.createdAt - b.createdAt);
  return { ...c, owner: publicUser(owner), tracks };
}

router.get("/", optionalAuth, (req, res) => {
  const { mode, instrument, q } = req.query;
  let collabs = db.get("collabs");
  if (mode) collabs = collabs.filter((c) => c.mode === mode);
  if (instrument) {
    const il = instrument.toString().toLowerCase();
    collabs = collabs.filter((c) =>
      (c.lookingFor || []).some((i) => i.toLowerCase().includes(il)),
    );
  }
  if (q) {
    const ql = q.toString().toLowerCase();
    collabs = collabs.filter(
      (c) =>
        c.title.toLowerCase().includes(ql) ||
        (c.description || "").toLowerCase().includes(ql),
    );
  }
  collabs = collabs
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(hydrate);
  res.json({ collabs });
});

router.get("/:id", optionalAuth, (req, res) => {
  const c = db.find("collabs", (it) => it.id === req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  res.json({ collab: hydrate(c) });
});

// mode: "open" (anyone may submit) | "invite" (owner approves submissions)
router.post(
  "/",
  requireAuth,
  upload.single("audio"),
  (req, res) => {
    const {
      title,
      description = "",
      mode = "open",
      lookingFor,
      bpm,
      key,
      genre = "",
      licenseNote = "",
    } = req.body || {};
    if (!title) return res.status(400).json({ error: "title required" });
    if (!req.file) return res.status(400).json({ error: "base track required" });
    const c = {
      id: nanoid(),
      userId: req.user.id,
      title,
      description,
      mode,
      lookingFor: lookingFor ? JSON.parse(lookingFor) : [],
      bpm: bpm ? Number(bpm) : null,
      key: key || null,
      genre,
      licenseNote,
      baseTrackUrl: fileUrl(req.file.filename),
      createdAt: Date.now(),
    };
    db.insert("collabs", c);
    res.json({ collab: hydrate(c) });
  },
);

// A user uploads a contribution (e.g. sax, guitar solo) for the collab.
router.post(
  "/:id/tracks",
  requireAuth,
  upload.single("audio"),
  (req, res) => {
    const collab = db.find("collabs", (it) => it.id === req.params.id);
    if (!collab) return res.status(404).json({ error: "not found" });
    if (!req.file) return res.status(400).json({ error: "audio required" });
    const { instrument = "", note = "" } = req.body || {};
    const status = collab.mode === "open" ? "approved" : "pending";
    const t = {
      id: nanoid(),
      collabId: collab.id,
      contributorId: req.user.id,
      instrument,
      note,
      audioUrl: fileUrl(req.file.filename),
      status,
      createdAt: Date.now(),
    };
    db.insert("collabTracks", t);
    if (collab.userId !== req.user.id) {
      db.insert("notifications", {
        id: nanoid(),
        userId: collab.userId,
        kind: "collab_track",
        text: `${req.user.displayName || req.user.username} submitted ${instrument || "a track"} on "${collab.title}"`,
        link: `/collabs/${collab.id}`,
        createdAt: Date.now(),
        read: false,
      });
    }
    res.json({
      track: { ...t, contributor: publicUser(req.user) },
    });
  },
);

router.post("/:id/tracks/:trackId/approve", requireAuth, (req, res) => {
  const collab = db.find("collabs", (it) => it.id === req.params.id);
  if (!collab) return res.status(404).json({ error: "not found" });
  if (collab.userId !== req.user.id)
    return res.status(403).json({ error: "owner only" });
  const t = db.update("collabTracks", req.params.trackId, { status: "approved" });
  if (!t) return res.status(404).json({ error: "track not found" });
  res.json({ track: t });
});

router.post("/:id/tracks/:trackId/reject", requireAuth, (req, res) => {
  const collab = db.find("collabs", (it) => it.id === req.params.id);
  if (!collab) return res.status(404).json({ error: "not found" });
  if (collab.userId !== req.user.id)
    return res.status(403).json({ error: "owner only" });
  const t = db.update("collabTracks", req.params.trackId, { status: "rejected" });
  if (!t) return res.status(404).json({ error: "track not found" });
  res.json({ track: t });
});

export default router;
