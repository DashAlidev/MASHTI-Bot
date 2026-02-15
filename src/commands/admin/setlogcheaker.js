import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("setlogcheaker")
  .setDescription("دادن دسترسی کامل Log Checker")
  .addUserOption(o =>
    o.setName("user").setDescription("کاربر").setRequired(true)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser("user");
  const member = interaction.guild.members.cache.get(user.id);

  await member.roles.add(process.env.LOGCHEAKER_ROLE_ID);

  interaction.reply(`✔️ دسترسی Log Checker به <@${user.id}> داده شد.`);
}
