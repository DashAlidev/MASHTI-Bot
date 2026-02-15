import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getAllXP } from "../../utils/xpManager.js";

export const data = new SlashCommandBuilder()
  .setName("xplist")
  .setDescription("نمایش لیست XP هفتگی");

export async function execute(interaction) {
  getAllXP(async (err, rows) => {
    if (err) return interaction.reply("❌ خطا در دیتابیس");

    const embed = new EmbedBuilder()
      .setColor("#0A84FF")
      .setTitle("📊 لیست XP هفتگی")
      .setDescription(
        rows.length === 0
          ? "هیچ XP ثبت نشده."
          : rows.map((r, i) =>
              `**${i + 1}.** <@${r.userId}> — **${r.weeklyXP} XP**`
            ).join("\n")
      )
      .setFooter({ text: "Created By Ali Yekta" });

    interaction.reply({ embeds: [embed] });
  });
}
