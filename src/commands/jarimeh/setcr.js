import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("setcr")
  .setDescription("دادن دسترسی CR به کاربر")
  .addUserOption(o =>
    o.setName("user").setDescription("کاربر").setRequired(true)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser("user");
  const member = interaction.guild.members.cache.get(user.id);

  await member.roles.add(process.env.CR_ROLE_ID);

  interaction.reply(`✔️ دسترسی CR به <@${user.id}> داده شد.`);
}
