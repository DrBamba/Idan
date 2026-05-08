import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UPLOAD_DIR } from "./upload.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import playlistRoutes from "./routes/playlists.js";
import teacherRoutes from "./routes/teachers.js";
import questionRoutes from "./routes/questions.js";
import marketRoutes from "./routes/marketplace.js";
import collabRoutes from "./routes/collabs.js";
import messageRoutes from "./routes/messages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/marketplace", marketRoutes);
app.use("/api/collabs", collabRoutes);
app.use("/api/messages", messageRoutes);

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^\/(?!api|uploads).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) res.status(404).send("Run `npm run build` to serve the client.");
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Harmonia server on :${PORT}`));
