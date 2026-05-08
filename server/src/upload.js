import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8);
    cb(null, `${Date.now()}-${nanoid(10)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export function fileUrl(filename) {
  if (!filename) return null;
  return `/uploads/${filename}`;
}
