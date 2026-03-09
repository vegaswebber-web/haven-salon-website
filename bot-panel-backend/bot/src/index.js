const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  // Partial message'ları handle et
  partials: ['MESSAGE', 'CHANNEL', 'GUILD_MEMBER']
});

// Komut tarafından silinen işlemleri izle
client.deletedByCommand = new Set();

// Event handler'ları yükle
const messageLogger = require('./handlers/messageLogger');
const voiceChannelJoin = require('./handlers/voiceChannelJoin');

messageLogger(client);
voiceChannelJoin(client);

client.commands = new Collection();
const prefix = process.env.PREFIX || '.';

// Türkçe karakterleri normalize et
function normalizeCommand(text) {
  return text
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

// Komutları yükle
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.name) {
    const normalizedName = normalizeCommand(command.name);
    client.commands.set(normalizedName, command);
    console.log(`✅ Komut yüklendi: ${command.name}`);
  }
}

// Bot hazır
client.once('ready', () => {
  console.log(`\n========================================`);
  console.log(`✅ Bot başladı! ${client.user.tag}`);
  console.log(`========================================\n`);
  client.user.setStatus('online');
  client.user.setActivity('.yardım | Zi Bot', { type: 'WATCHING' });
});

// Mesaj sistemi
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const parts = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = normalizeCommand(parts[0]);
  const args = parts.slice(1);

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('❌ Komut çalıştırılırken bir hata oluştu!').catch(() => {});
  }
});

client.login(process.env.TOKEN);
