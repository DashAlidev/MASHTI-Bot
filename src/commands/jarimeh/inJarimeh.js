import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserJarimeh } from "../../utils/jarimehManager.js";

export const data = new SlashCommandBuilder()
  .setName("injarimeh")
  .setDescription("مشاهده جریمه‌های خود کاربر");

export async function execute(interaction) {
  const userId = interaction.user.id;

  getUserJarimeh(userId, (err, rows) => {
    if (err) return interaction.reply("❌ خطا در دیتابیس");

    const total = rows.reduce((sum, r) => sum + r.amount, 0);

    const embed = new EmbedBuilder()
      .setColor("#0A84FF")
      .setTitle("💳 لیست جریمه‌های شما")
      .setDescription(
        rows.length === 0
          ? "هیچ جریمه‌ای برای شما ثبت نشده."
          : rows
              .map(r => `• **${r.reason}** — ${r.amount.toLocaleString()} $`)
              .join("\n")
      )
      .addFields({
        name: "💰 مجموع جریمه‌ها",
        value: `${total.toLocaleString()} $`
      })
      .setFooter({ text: "Created By Ali Yekta" });

    interaction.reply({ embeds: [embed], ephemeral: true });
  });
}
