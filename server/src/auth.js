import jwt from "jsonwebtoken";
import { db } from "./db.js";

const SECRET = process.env.JWT_SECRET || "harmonia-dev-secret-change-me";

export function signToken(userId) {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return res.status(401).json({ error: "unauthorized" });
  const user = db.find("users", (u) => u.id === decoded.uid);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  req.user = user;
  next();
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const decoded = token ? verifyToken(token) : null;
  if (decoded) req.user = db.find("users", (u) => u.id === decoded.uid) || null;
  next();
}

export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}
