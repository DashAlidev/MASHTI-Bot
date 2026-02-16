import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { addJarimeh } from "../../utils/jarimehManager.js";
import { db } from "../../database/db.js";

export const data = new SlashCommandBuilder()
  .setName("jarimeh")
  .setDescription("ثبت جریمه برای کاربر")
  .addStringOption(o =>
    o.setName("reason")
      .setDescription("دلیل جریمه")
      .setRequired(true)
      .addChoices(
        { name: "Repair (60k)", value: "Repair" },
        { name: "Engine (350k)", value: "Engine" },
        { name: "Impound (90k)", value: "Impound" }
      )
  )
  .addUserOption(o =>
    o.setName("user")
      .setDescription("کاربر (اختیاری اگر Hex وارد شود)")
      .setRequired(false)
  )
  .addStringOption(o =>
    o.setName("hex")
      .setDescription("Steam Hex (اختیاری)")
      .setRequired(false)
  )
  .addStringOption(o =>
    o.setName("description")
      .setDescription("توضیحات اضافی (اختیاری)")
      .setRequired(false)
  );

export async function execute(interaction) {
  const reason = interaction.options.getString("reason");
  const user = interaction.options.getUser("user");
  const hex = interaction.options.getString("hex");
  const description = interaction.options.getString("description") || "—";

  let amount = 0;
  if (reason === "Repair") amount = 60000;
  if (reason === "Engine") amount = 350000;
  if (reason === "Impound") amount = 90000;

  let targetUserId = null;

  if (user) {
    targetUserId = user.id;
  } else if (hex) {
    await new Promise(resolve => {
      db.get(`SELECT userId FROM users WHERE hex = ?`, [hex], (err, row) => {
        if (row) targetUserId = row.userId;
        resolve();
      });
    });
  }

  if (!targetUserId) {
    return interaction.reply({
      content: "❌ کاربر یافت نشد. لطفاً Hex یا User را درست وارد کنید.",
      ephemeral: true
    });
  }

  addJarimeh(targetUserId, amount, reason, description);

  const embed = new EmbedBuilder()
    .setColor("#0A84FF")
    .setTitle("💳 ثبت جریمه جدید")
    .addFields(
      { name: "👤 کاربر", value: `<@${targetUserId}>`, inline: true },
      { name: "📌 دلیل", value: reason, inline: true },
      { name: "💰 مبلغ", value: `$${amount.toLocaleString()}`, inline: true },
      { name: "📝 توضیحات", value: description }
    )
    .setFooter({ text: "Created By Ali Yekta" })
    .setTimestamp();

  const channel = interaction.guild.channels.cache.get(process.env.JARIMEH_CHANNEL);
  await channel.send({ embeds: [embed] });

  interaction.reply({ content: "✔️ جریمه ثبت شد.", ephemeral: true });
}
