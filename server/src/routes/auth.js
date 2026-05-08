import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { signToken, requireAuth, publicUser } from "../auth.js";

const router = Router();

const VALID_TYPES = ["musician", "producer", "business", "listener", "teacher"];

router.post("/register", async (req, res) => {
  const { username, email, password, displayName, accountType } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: "missing fields" });
  }
  if (!VALID_TYPES.includes(accountType)) {
    return res.status(400).json({ error: "invalid account type" });
  }
  const exists = db.find("users", (u) => u.username === username || u.email === email);
  if (exists) return res.status(409).json({ error: "username or email taken" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(),
    username,
    email,
    passwordHash,
    displayName: displayName || username,
    accountType,
    bio: "",
    avatarUrl: null,
    location: "",
    instruments: [],
    genres: [],
    isPrivate: false,
    spotifyConnected: false,
    createdAt: Date.now(),
  };
  db.insert("users", user);
  res.json({ token: signToken(user.id), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body || {};
  const user = db.find(
    "users",
    (u) => u.username === identifier || u.email === identifier,
  );
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  res.json({ token: signToken(user.id), user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
