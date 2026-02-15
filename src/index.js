import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "./database/db.js";
import "./cron/weeklyReset.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = await import(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// Load Events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.BOT_TOKEN);
