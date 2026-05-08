import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const defaultData = {
  users: [],
  posts: [],
  comments: [],
  likes: [],
  follows: [],
  playlists: [],
  teacherProfiles: [],
  reviews: [],
  questions: [],
  answers: [],
  listings: [],
  collabs: [],
  collabTracks: [],
  messages: [],
  notifications: [],
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
  }
}

ensureFile();

let cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
for (const key of Object.keys(defaultData)) {
  if (!cache[key]) cache[key] = [];
}

let writeTimer = null;
function scheduleWrite() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
  }, 50);
}

export const db = {
  get(table) {
    return cache[table];
  },
  insert(table, row) {
    cache[table].push(row);
    scheduleWrite();
    return row;
  },
  update(table, id, patch) {
    const idx = cache[table].findIndex((r) => r.id === id);
    if (idx === -1) return null;
    cache[table][idx] = { ...cache[table][idx], ...patch };
    scheduleWrite();
    return cache[table][idx];
  },
  remove(table, predicate) {
    const before = cache[table].length;
    cache[table] = cache[table].filter((r) => !predicate(r));
    if (cache[table].length !== before) scheduleWrite();
  },
  find(table, predicate) {
    return cache[table].find(predicate);
  },
  filter(table, predicate) {
    return cache[table].filter(predicate);
  },
  reset(seed) {
    cache = { ...defaultData, ...seed };
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
  },
};
