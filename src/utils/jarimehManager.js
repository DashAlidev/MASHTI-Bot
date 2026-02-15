import { db } from "../database/db.js";

export function addJarimeh(userId, amount, reason, description) {
  const timestamp = new Date().toISOString();

  db.run(
    `
    INSERT INTO jarimeh (userId, amount, reason, description, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `,
    [userId, amount, reason, description, timestamp]
  );
}

export function getUserJarimeh(userId, callback) {
  db.all(
    `
    SELECT * FROM jarimeh
    WHERE userId = ?
    ORDER BY id DESC
  `,
    [userId],
    callback
  );
}
