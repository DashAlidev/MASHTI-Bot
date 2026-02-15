import { addXP } from "../utils/xpManager.js";
import { robTypes } from "../utils/robConfig.js";
import { EmbedBuilder } from "discord.js";

export const name = "interactionCreate";

export async function execute(interaction, client) {
  // Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ خطایی رخ داد!",
        ephemeral: true
      });
    }
  }

  // Buttons (Approve)
  if (interaction.isButton()) {
    if (!interaction.customId.startsWith("approve_")) return;

    // فقط رول LogChecker اجازه داره
    if (!interaction.member.roles.cache.has(process.env.LOGCHEAKER_ROLE_ID)) {
      return interaction.reply({
        content: "❌ شما اجازه تایید ندارید.",
        ephemeral: true
      });
    }

    const embed = interaction.message.embeds[0];
    if (!embed) return;

    const robLine = embed.data.description.split("\n")[0];
    const resultLine = embed.data.description.split("\n")[1];
    const xpLine = embed.data.description.split("\n")[2];

    const rob = robLine.replace("Rob: **", "").replace("**", "");
    const result = resultLine.replace("نتیجه: **", "").replace("**", "");
    const xp = parseInt(xpLine.replace("XP: **", "").replace("**", ""));

    const playersField = embed.data.fields[0].value;
    const players = playersField
      .split("\n")
      .map(line => line.replace("• <", "").replace(">", "").replace("@", ""));

    // اضافه کردن XP
    if (result === "Win") {
      players.forEach(id => addXP(id, xp));
    }

    // پیام تایید شده
    const approvedEmbed = new EmbedBuilder()
      .setColor("#34C759")
      .setTitle("✅ Rob تایید شد")
      .setDescription(
        `Rob: **${rob}**\nنتیجه: **${result}**\nXP: **${xp}**`
      )
      .addFields({
        name: "👥 پلیرها",
        value: players.map(id => `• <@${id}>`).join("\n")
      })
      .setFooter({ text: "Created By Ali Yekta" })
      .setTimestamp();

    const cmdChannel = interaction.guild.channels.cache.get(process.env.CMD_CHANNEL);
    await cmdChannel.send({ embeds: [approvedEmbed] });

    await interaction.update({
      content: "✔️ این Rob تایید شد.",
      components: []
    });
  }
}
