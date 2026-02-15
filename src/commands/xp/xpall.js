import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getAllXP } from "../../utils/xpManager.js";

export const data = new SlashCommandBuilder()
  .setName("xpall")
  .setDescription("نمایش XP کل کاربران");

export async function execute(interaction) {
  getAllXP(async (err, rows) => {
    if (err) return interaction.reply("❌ خطا در دیتابیس");

    const embed = new EmbedBuilder()
      .setColor("#0A84FF")
      .setTitle("📘 XP کل کاربران")
      .setDescription(
        rows.length === 0
          ? "هیچ XP ثبت نشده."
          : rows.map((r, i) =>
              `**${i + 1}.** <@${r.userId}> — **${r.totalXP} XP**`
            ).join("\n")
      )
      .setFooter({ text: "Created By Ali Yekta" });

    interaction.reply({ embeds: [embed] });
  });
}
