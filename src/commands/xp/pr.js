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
  .setDescription("ثبت Rob برای تایید")
  .addStringOption(option =>
    option.setName("rob")
      .setDescription("نوع Rob را انتخاب کنید")
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
      .setDescription("نتیجه Rob")
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

  const baseColor =
    result === "Win" ? "#1ED760" :
    result === "Lose" ? "#FF4C4C" :
    "#F0B429";

  const embed = new EmbedBuilder()
    .setColor(baseColor)
    .setTitle("ROB SUBMISSION")
    .setDescription(
`━━━━━━━━━━━━━━━━━━

**🏦 ROB TYPE**
# ${rob}

**📊 RESULT**
# ${result}

**⚡ XP REWARD**
# ${xp}

━━━━━━━━━━━━━━━━━━`
    )
    .addFields({
      name: "👥 Participants",
      value: players.map((p, i) => `\`${i + 1}.\` <@${p.id}>`).join("\n"),
    })
    .setFooter({
      text: "Created By 『ALI YEKTA』 • Gang System",
      iconURL: client.user.displayAvatarURL()
    })
    .setTimestamp();

  const approveBtn = new ButtonBuilder()
    .setCustomId(`approve_${Date.now()}`)
    .setLabel("Approve")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(approveBtn);

  const channel = interaction.guild.channels.cache.get(process.env.XP_ROB_CHANNEL);

  const message = await channel.send({
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content: "درخواست Rob ارسال شد و منتظر تایید است.",
    ephemeral: true
  });

  // 🔥 Collector برای تغییر دکمه بعد از تایید
  const collector = message.createMessageComponentCollector({ time: 86400000 });

  collector.on("collect", async i => {

    if (!i.customId.startsWith("approve_")) return;

    // اینجا میتونی چک رول High Rank بزاری اگر خواستی
    // مثال:
    // if (!i.member.roles.cache.has("ROLE_ID")) return i.reply({ content: "دسترسی نداری", ephemeral: true });

    const approvedEmbed = EmbedBuilder.from(embed)
      .setColor("#2ECC71")
      .setTitle("ROB APPROVED ✅");

    const disabledButton = new ButtonBuilder()
      .setCustomId("approved")
      .setLabel("✔ تایید شد")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true);

    const newRow = new ActionRowBuilder().addComponents(disabledButton);

    await i.update({
      embeds: [approvedEmbed],
      components: [newRow]
    });

    collector.stop();
  });

}
