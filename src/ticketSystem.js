// ticketBot.js
import { Client, GatewayIntentBits, Partials, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } from "discord.js";
import fs from "fs";
import path from "path";
import 'dotenv/config';

// === تنظیمات ===
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

// ذخیره داده‌ها
const DATA_FILE = path.join("./tickets.json");
let ticketsData = {};
if (fs.existsSync(DATA_FILE)) ticketsData = JSON.parse(fs.readFileSync(DATA_FILE));

// کانال تیکت تنظیم شده
let TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID || null;

// === کلاینت ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// === ثبت کامندها ===
client.on("ready", async () => {
  console.log(`✅ بات ${client.user.tag} آنلاین شد!`);

  const guild = await client.guilds.fetch(GUILD_ID);

  // ثبت کامند /membership
  await guild.commands.create(
    new SlashCommandBuilder()
      .setName("membership")
      .setDescription("درخواست عضویت و ایجاد تیکت")
  );

  // ثبت کامند /sticket برای تعیین کانال تیکت
  await guild.commands.create(
    new SlashCommandBuilder()
      .setName("sticket")
      .setDescription("تنظیم چنل دسته‌بندی تیکت")
      .addChannelOption(option =>
        option.setName("channel")
          .setDescription("چنل دسته‌بندی تیکت را انتخاب کنید")
          .setRequired(true)
      )
  );
});

// === تعاملات ===
client.on("interactionCreate", async (interaction) => {

  // ------------- /sticket -------------
  if (interaction.isChatInputCommand() && interaction.commandName === "sticket") {
    // فقط مدیر یا رنک
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
        !interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({ content: "❌ شما اجازه تغییر چنل تیکت را ندارید.", ephemeral: true });
    }

    const channel = interaction.options.getChannel("channel");
    TICKET_CATEGORY_ID = channel.id;

    // ذخیره در ENV (یا میتونی ذخیره تو فایل کن)
    fs.writeFileSync("./.ticket_env.json", JSON.stringify({ TICKET_CATEGORY_ID }));

    return interaction.reply({ content: `✅ چنل تیکتینگ روی <#${channel.id}> تنظیم شد.`, ephemeral: true });
  }

  // ------------- /membership -------------
  if (interaction.isChatInputCommand() && interaction.commandName === "membership") {
    const userId = interaction.user.id;

    if (!TICKET_CATEGORY_ID) return interaction.reply({ content: "❌ هنوز چنل دسته‌بندی تیکت تنظیم نشده!", ephemeral: true });

    if (ticketsData[userId]) return interaction.reply({ content: "⚠️ شما هم‌اکنون یک تیکت فعال دارید!", ephemeral: true });

    await interaction.reply({ content: "⏳ درحال شروع فرآیند ایجاد تیکت...", ephemeral: true });

    const questions = [
      "⏰ زمان بازی شما در روز چقدر است؟",
      "💰 آیا تجربه‌ی ربودن دارید؟",
      "📝 چه رب‌های زده‌اید؟",
      "🏘 آیا به Mappery رب‌ها مسلط هستید؟",
      "👮 آیا در ارگان PD/MT/Sheriff بوده‌اید؟",
      "💣 در چه گنگ‌هایی حضور داشته‌اید؟"
    ];

    const answers = [];
    const filter = (m) => m.author.id === userId;
    const channelPrompt = await interaction.channel.send("📋 لطفاً به سوالات زیر پاسخ دهید:");

    for (const question of questions) {
      await channelPrompt.send(`**${question}**`);
      const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 300000,
        errors: ["time"]
      }).catch(() => null);

      if (!collected || collected.size === 0) {
        channelPrompt.send("⌛ زمان پاسخ‌دهی به پایان رسید!");
        return;
      }

      answers.push({ question, answer: collected.first().content });
    }

    // ایجاد کانال تیکت خصوصی
    const guild = interaction.guild;
    const ticketChannel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: 0,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: userId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    ticketsData[userId] = {
      channelId: ticketChannel.id,
      answers,
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(ticketsData, null, 2));

    // Embed شیک
    const embed = new EmbedBuilder()
      .setTitle("📝 تیکت عضویت جدید")
      .setDescription(`کاربر: <@${userId}>`)
      .setColor(0x1abc9c)
      .setFooter({ text: "تیم ما به زودی پاسخ می‌دهد" })
      .setTimestamp();

    answers.forEach((q, i) => embed.addFields({ name: `❖ ${q.question}`, value: `➡️ ${q.answer}`, inline: false }));

    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 بستن تیکت")
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: `سلام <@${userId}>! 🎉 به تیکت شما خوش آمدیم.`,
      embeds: [embed],
      components: [closeButton]
    });

    interaction.followUp({ content: `✅ تیکت شما ساخته شد: ${ticketChannel}`, ephemeral: true });
  }

  // ------------- بستن تیکت -------------
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    const userId = Object.keys(ticketsData).find(id => ticketsData[id].channelId === interaction.channel.id);
    if (!userId) return interaction.reply({ content: "❌ تیکتی یافت نشد.", ephemeral: true });

    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ شما اجازه بستن تیکت را ندارید.", ephemeral: true });
    }

    const ticket = ticketsData[userId];

    let htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>تیکت عضویت</title>
        <style>
          body { font-family: Tahoma, Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; }
          h2 { color: #1abc9c; border-bottom: 2px solid #1abc9c; padding-bottom: 5px; }
          ul { list-style-type: none; padding: 0; }
          li { background: #fff; margin: 10px 0; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          b { color: #16a085; }
        </style>
      </head>
      <body>
        <h2>تیکت عضویت شما</h2>
        <p>تاریخ: ${new Date(ticket.createdAt).toLocaleString()}</p>
        <ul>
    `;
    ticket.answers.forEach(a => htmlContent += `<li><b>${a.question}</b>: ${a.answer}</li>`);
    htmlContent += `</ul></body></html>`;

    const member = await interaction.guild.members.fetch(userId);
    await member.send({ content: "تیکت شما بسته شد ✅", files: [{ attachment: Buffer.from(htmlContent, "utf-8"), name: "ticket.html" }] });

    delete ticketsData[userId];
    fs.writeFileSync(DATA_FILE, JSON.stringify(ticketsData, null, 2));

    await interaction.channel.delete();
  }
});

client.login(TOKEN);
