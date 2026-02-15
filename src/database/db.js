import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "mashti.sqlite");

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ DB Error:", err);
  else console.log("📁 Database Loaded");
});

// XP TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS xp (
    userId TEXT PRIMARY KEY,
    weeklyXP INTEGER DEFAULT 0,
    totalXP INTEGER DEFAULT 0
  )
`);

// JARIMEH TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS jarimeh (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    amount INTEGER,
    reason TEXT,
    description TEXT,
    timestamp TEXT
  )
`);

// USERS TABLE (Steam Hex)
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    hex TEXT
  )
`);
