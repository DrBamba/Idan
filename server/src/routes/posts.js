import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, optionalAuth, publicUser } from "../auth.js";
import { upload, fileUrl } from "../upload.js";

const router = Router();

function hydrate(post) {
  const author = db.find("users", (u) => u.id === post.userId);
  const likeCount = db.filter("likes", (l) => l.postId === post.id).length;
  const commentCount = db.filter("comments", (c) => c.postId === post.id).length;
  return { ...post, author: publicUser(author), likeCount, commentCount };
}

router.post(
  "/",
  requireAuth,
  upload.single("media"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "media required" });
    const { caption = "", mediaType, tags } = req.body;
    const post = {
      id: nanoid(),
      userId: req.user.id,
      mediaUrl: fileUrl(req.file.filename),
      mediaType:
        mediaType ||
        (req.file.mimetype.startsWith("video/")
          ? "video"
          : req.file.mimetype.startsWith("audio/")
            ? "audio"
            : "image"),
      caption,
      tags: tags ? JSON.parse(tags) : [],
      createdAt: Date.now(),
    };
    db.insert("posts", post);
    res.json({ post: hydrate(post) });
  },
);

router.get("/feed", requireAuth, (req, res) => {
  const followingRows = db.filter("follows", (f) => f.followerId === req.user.id);
  const ids = new Set(followingRows.map((r) => r.followingId));
  ids.add(req.user.id);
  const posts = db
    .filter("posts", (p) => ids.has(p.userId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 100)
    .map(hydrate);
  res.json({ posts });
});

router.get("/explore", optionalAuth, (_req, res) => {
  const posts = [...db.get("posts")]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 60)
    .map(hydrate);
  res.json({ posts });
});

router.get("/user/:username", optionalAuth, (req, res) => {
  const user = db.find("users", (u) => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: "not found" });
  const posts = db
    .filter("posts", (p) => p.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(hydrate);
  res.json({ posts });
});

router.post("/:id/like", requireAuth, (req, res) => {
  const post = db.find("posts", (p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "not found" });
  const existing = db.find(
    "likes",
    (l) => l.postId === post.id && l.userId === req.user.id,
  );
  if (existing) {
    db.remove(
      "likes",
      (l) => l.postId === post.id && l.userId === req.user.id,
    );
    return res.json({ liked: false });
  }
  db.insert("likes", {
    id: nanoid(),
    postId: post.id,
    userId: req.user.id,
    createdAt: Date.now(),
  });
  res.json({ liked: true });
});

router.get("/:id/comments", (req, res) => {
  const comments = db
    .filter("comments", (c) => c.postId === req.params.id)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((c) => ({
      ...c,
      author: publicUser(db.find("users", (u) => u.id === c.userId)),
    }));
  res.json({ comments });
});

router.post("/:id/comments", requireAuth, (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });
  const comment = {
    id: nanoid(),
    postId: req.params.id,
    userId: req.user.id,
    text,
    createdAt: Date.now(),
  };
  db.insert("comments", comment);
  res.json({
    comment: { ...comment, author: publicUser(req.user) },
  });
});

export default router;
