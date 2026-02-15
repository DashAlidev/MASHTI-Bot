import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
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
    option.setName("player1")
      .setDescription("پلیر اول")
      .setRequired(true)
  )
  .addUserOption(option =>
    option.setName("player2")
      .setDescription("پلیر دوم")
      .setRequired(false)
  )
  .addUserOption(option =>
    option.setName("player3")
      .setDescription("پلیر سوم")
      .setRequired(false)
  )
  .addUserOption(option =>
    option.setName("player4")
      .setDescription("پلیر چهارم")
      .setRequired(false)
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

  const embed = new EmbedBuilder()
    .setColor("#0A84FF")
    .setTitle("📌 درخواست ثبت Rob")
    .setDescription(`Rob: **${rob}**\nنتیجه: **${result}**\nXP: **${xp}**`)
    .addFields(
      {
        name: "👥 پلیرها",
        value: players.map(p => `• <@${p.id}>`).join("\n")
      }
    )
    .setFooter({ text: "Created By Ali Yekta", iconURL: "LOGO_URL_HERE" })
    .setTimestamp();

  const approveBtn = new ButtonBuilder()
    .setCustomId(`approve_${Date.now()}`)
    .setLabel("Approve")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(approveBtn);

  const channel = interaction.guild.channels.cache.get(process.env.XP_ROB_CHANNEL);

  await channel.send({ embeds: [embed], components: [row] });

  await interaction.reply({ content: "درخواست Rob ارسال شد.", ephemeral: true });
}
