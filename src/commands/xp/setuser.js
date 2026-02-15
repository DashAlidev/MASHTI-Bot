import { SlashCommandBuilder } from "discord.js";
import { db } from "../../database/db.js";

export const data = new SlashCommandBuilder()
  .setName("setuser")
  .setDescription("ثبت Steam Hex برای کاربر")
  .addUserOption(o =>
    o.setName("user").setDescription("کاربر").setRequired(true)
  )
  .addStringOption(o =>
    o.setName("hex").setDescription("Steam Hex").setRequired(true)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser("user");
  const hex = interaction.options.getString("hex");

  db.run(
    `
    INSERT INTO users (userId, hex)
    VALUES (?, ?)
    ON CONFLICT(userId)
    DO UPDATE SET hex = ?
  `,
    [user.id, hex, hex]
  );

  interaction.reply(`Hex برای <@${user.id}> ثبت شد.`);
}
