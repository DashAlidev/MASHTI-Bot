import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { removeXP } from "../../utils/xpManager.js";

export const data = new SlashCommandBuilder()
  .setName("dexp")
  .setDescription("کسر XP از کاربر")
  .addUserOption(o =>
    o.setName("user").setDescription("کاربر").setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName("amount").setDescription("مقدار XP").setRequired(true)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser("user");
  const amount = interaction.options.getInteger("amount");

  removeXP(user.id, amount);

  const embed = new EmbedBuilder()
    .setColor("#FF3B30")
    .setTitle("❗ کسر XP")
    .setDescription(`از <@${user.id}> مقدار **${amount} XP** کم شد.`)
    .setFooter({ text: "Created By Ali Yekta" });

  interaction.reply({ embeds: [embed] });
}
