import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, publicUser } from "../auth.js";

const router = Router();

function threadKey(a, b) {
  return [a, b].sort().join(":");
}

router.get("/threads", requireAuth, (req, res) => {
  const mine = db.filter(
    "messages",
    (m) => m.fromId === req.user.id || m.toId === req.user.id,
  );
  const map = new Map();
  for (const m of mine) {
    const otherId = m.fromId === req.user.id ? m.toId : m.fromId;
    const k = threadKey(req.user.id, otherId);
    const existing = map.get(k);
    if (!existing || existing.createdAt < m.createdAt)
      map.set(k, { ...m, otherId });
  }
  const threads = [...map.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((t) => ({
      ...t,
      other: publicUser(db.find("users", (u) => u.id === t.otherId)),
    }));
  res.json({ threads });
});

router.get("/with/:userId", requireAuth, (req, res) => {
  const otherId = req.params.userId;
  const messages = db
    .filter(
      "messages",
      (m) =>
        (m.fromId === req.user.id && m.toId === otherId) ||
        (m.fromId === otherId && m.toId === req.user.id),
    )
    .sort((a, b) => a.createdAt - b.createdAt);
  res.json({
    other: publicUser(db.find("users", (u) => u.id === otherId)),
    messages,
  });
});

router.post("/with/:userId", requireAuth, (req, res) => {
  const otherId = req.params.userId;
  const target = db.find("users", (u) => u.id === otherId);
  if (!target) return res.status(404).json({ error: "user not found" });
  const { text, attachUrl, kind = "text" } = req.body || {};
  if (!text && !attachUrl)
    return res.status(400).json({ error: "empty message" });
  const m = {
    id: nanoid(),
    fromId: req.user.id,
    toId: otherId,
    text: text || "",
    attachUrl: attachUrl || null,
    kind,
    read: false,
    createdAt: Date.now(),
  };
  db.insert("messages", m);
  res.json({ message: m });
});

export default router;
