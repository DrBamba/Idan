import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, optionalAuth, publicUser } from "../auth.js";

const router = Router();

function hydrateQuestion(q) {
  const author = db.find("users", (u) => u.id === q.userId);
  const answers = db.filter("answers", (a) => a.questionId === q.id);
  return {
    ...q,
    author: publicUser(author),
    answerCount: answers.length,
  };
}

router.get("/", optionalAuth, (req, res) => {
  const { q, tag } = req.query;
  let questions = db.get("questions");
  if (q) {
    const ql = q.toString().toLowerCase();
    questions = questions.filter(
      (it) =>
        it.title.toLowerCase().includes(ql) ||
        it.body.toLowerCase().includes(ql),
    );
  }
  if (tag) {
    questions = questions.filter((it) => (it.tags || []).includes(tag));
  }
  questions = questions
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(hydrateQuestion);
  res.json({ questions });
});

router.get("/:id", optionalAuth, (req, res) => {
  const q = db.find("questions", (it) => it.id === req.params.id);
  if (!q) return res.status(404).json({ error: "not found" });
  const answers = db
    .filter("answers", (a) => a.questionId === q.id)
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .map((a) => ({
      ...a,
      author: publicUser(db.find("users", (u) => u.id === a.userId)),
    }));
  res.json({ question: hydrateQuestion(q), answers });
});

router.post("/", requireAuth, (req, res) => {
  const { title, body = "", tags = [] } = req.body || {};
  if (!title) return res.status(400).json({ error: "title required" });
  const q = {
    id: nanoid(),
    userId: req.user.id,
    title,
    body,
    tags,
    createdAt: Date.now(),
  };
  db.insert("questions", q);
  res.json({ question: hydrateQuestion(q) });
});

router.post("/:id/answers", requireAuth, (req, res) => {
  const q = db.find("questions", (it) => it.id === req.params.id);
  if (!q) return res.status(404).json({ error: "not found" });
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });
  const a = {
    id: nanoid(),
    questionId: q.id,
    userId: req.user.id,
    text,
    upvotes: 0,
    upvoters: [],
    createdAt: Date.now(),
  };
  db.insert("answers", a);
  res.json({ answer: { ...a, author: publicUser(req.user) } });
});

router.post("/answers/:id/upvote", requireAuth, (req, res) => {
  const a = db.find("answers", (it) => it.id === req.params.id);
  if (!a) return res.status(404).json({ error: "not found" });
  const upvoters = new Set(a.upvoters || []);
  if (upvoters.has(req.user.id)) upvoters.delete(req.user.id);
  else upvoters.add(req.user.id);
  const updated = db.update("answers", a.id, {
    upvoters: [...upvoters],
    upvotes: upvoters.size,
  });
  res.json({ answer: updated });
});

export default router;
