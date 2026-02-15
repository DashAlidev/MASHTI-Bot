import { db } from "../database/db.js";

export function addXP(userId, amount) {
  db.run(
    `
    INSERT INTO xp (userId, weeklyXP, totalXP)
    VALUES (?, ?, ?)
    ON CONFLICT(userId)
    DO UPDATE SET
      weeklyXP = weeklyXP + ?,
      totalXP = totalXP + ?
  `,
    [userId, amount, amount, amount, amount]
  );
}

export function removeXP(userId, amount) {
  db.run(
    `
    UPDATE xp
    SET weeklyXP = weeklyXP - ?, totalXP = totalXP - ?
    WHERE userId = ?
  `,
    [amount, amount, userId]
  );
}

export function getAllXP(callback) {
  db.all(`SELECT * FROM xp ORDER BY weeklyXP DESC`, callback);
}
