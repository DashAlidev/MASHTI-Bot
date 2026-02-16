import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import { robTypes } from "../../utils/robConfig.js";

export const data = new SlashCommandBuilder()
  .setName("pr")
  .setDescription("ثبت راب برای تایید")
  .addStringOption(option =>
    option.setName("rob")
      .setDescription("نوع راب را انتخاب کنید")
      .setRequired(true)
      .addChoices(
        { name: "Shop", value: "Shop" },
        { name: "Mini Bank", value: "Mini Bank" },
        { name: "Jaw Shams", value: "Jaw Shams" },
        { name: "Maze Bank", value: "Maze Bank" }
      )
  )
  .addStringOption(option =>
    option.setName("result")
      .setDescription("نتیجه راب")
      .setRequired(true)
      .addChoices(
        { name: "Win", value: "Win" },
        { name: "No PD", value: "No PD" },
        { name: "Lose", value: "Lose" }
      )
  )
  .addUserOption(option =>
    option.setName("player1").setDescription("پلیر اول").setRequired(true)
  )
  .addUserOption(option =>
    option.setName("player2").setDescription("پلیر دوم")
  )
  .addUserOption(option =>
    option.setName("player3").setDescription("پلیر سوم")
  )
  .addUserOption(option =>
    option.setName("player4").setDescription("پلیر چهارم")
  );

export async function execute(interaction, client) {

  const rob = interaction.options.getString("rob");
  const result = interaction.options.getString("result");

  const players = [
    interaction.options.getUser("player1"),
    interaction.options.getUser("player2"),
    interaction.options.getUser("player3"),
    interaction.options.getUser("player4")
  ].filter(Boolean);

  const robInfo = robTypes[rob];
  const xp = result === "Win" ? robInfo.xp : 0;

  // 📅 تاریخ شمسی بدون هیچ پکیجی
  const nowShamsi = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const baseColor =
    result === "Win" ? "#22C55E" :
    result === "Lose" ? "#EF4444" :
    "#F59E0B";

  const embed = new EmbedBuilder()
    .setColor(baseColor)
    .setTitle("ثبت جدید راب")
    .setDescription(
`━━━━━━━━━━━━━━━━━━

**🏦 نوع راب**
${rob}

**📊 نتیجه**
${result}

**⚡ میزان XP**
${xp}

━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: "اعضای شرکت کننده",
        value: players.map((p, i) => `\`${i + 1}.\` <@${p.id}>`).join("\n"),
      },
      {
        name: "زمان ثبت",
        value: `📅 ${nowShamsi}`
      }
    )
    .setFooter({
      text: "Created By 『ALI YEKTA』 • سیستم مدیریت گنگ",
      iconURL: client.user.displayAvatarURL()
    })
    .setTimestamp();

  const approveBtn = new ButtonBuilder()
    .setCustomId(`approve_${Date.now()}`)
    .setLabel("تایید")
    .setStyle(ButtonStyle.Success);

  const rejectBtn = new ButtonBuilder()
    .setCustomId(`reject_${Date.now()}`)
    .setLabel("رد")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(approveBtn, rejectBtn);

  const channel = interaction.guild.channels.cache.get(process.env.XP_ROB_CHANNEL);

  const message = await channel.send({
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content: "درخواست راب ارسال شد و منتظر بررسی مدیریت است.",
    ephemeral: true
  });

  const collector = message.createMessageComponentCollector({ time: 86400000 });

  collector.on("collect", async i => {

    if (!i.customId.startsWith("approve_") && !i.customId.startsWith("reject_")) return;

    const isApprove = i.customId.startsWith("approve_");

    const updatedEmbed = EmbedBuilder.from(embed)
      .setColor(isApprove ? "#16A34A" : "#DC2626")
      .setTitle(isApprove ? "راب تایید شد" : "راب رد شد")
      .addFields({
        name: "وضعیت نهایی",
        value: isApprove
          ? "✅ این راب توسط مدیریت تایید شد."
          : "❌ این راب توسط مدیریت رد شد."
      });

    const disabledApprove = new ButtonBuilder()
      .setCustomId("approved_done")
      .setLabel(isApprove ? "✔ تایید شد" : "تایید")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true);

    const disabledReject = new ButtonBuilder()
      .setCustomId("rejected_done")
      .setLabel(!isApprove ? "✖ رد شد" : "رد")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true);

    const newRow = new ActionRowBuilder().addComponents(disabledApprove, disabledReject);

    await i.update({
      embeds: [updatedEmbed],
      components: [newRow]
    });

    collector.stop();
  });

}
