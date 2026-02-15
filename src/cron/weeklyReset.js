import cron from "cron";
import { db } from "../database/db.js";
import { EmbedBuilder } from "discord.js";
import { Client } from "discord.js";

// این کلاینت فقط برای ارسال پیام استفاده می‌شود
const client = new Client({ intents: [] });

// اتصال توکن
client.login(process.env.BOT_TOKEN);

// کرون جاب: جمعه ساعت 23:59 تهران
const job = new cron.CronJob(
  "59 23 * * 5",
  async () => {
    console.log("🔄 Weekly XP Reset Started");

    // گرفتن لیست XP قبل از ریست
    db.all(`SELECT * FROM xp ORDER BY weeklyXP DESC`, async (err, rows) => {
      if (err) return console.log("DB Error:", err);

      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const channel = guild.channels.cache.get(process.env.ANNOUNCE_CHANNEL);

      const embed = new EmbedBuilder()
        .setColor("#0A84FF")
        .setTitle("📢 گزارش هفتگی XP")
        .setDescription(
          rows.length === 0
            ? "هیچ XP ثبت نشده."
            : rows
                .map(
                  (r, i) =>
                    `**${i + 1}.** <@${r.userId}> — **${r.weeklyXP} XP**`
                )
                .join("\n")
        )
        .setFooter({ text: "Created By Ali Yekta" })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      // ریست XP هفتگی
      db.run(`UPDATE xp SET weeklyXP = 0`);
      console.log("✔️ Weekly XP Reset Completed");
    });
  },
  null,
  true,
  "Asia/Tehran"
);

job.start();
