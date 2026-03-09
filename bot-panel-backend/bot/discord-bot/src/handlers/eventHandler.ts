import { Client, GatewayIntentBits } from 'discord.js';
import { commandHandler } from './commandHandler';
import { config } from '../utils/config';

export const eventHandler = (client: Client) => {
    client.once('ready', () => {
        console.log(`Logged in as ${client.user?.tag}`);
    });

    client.on('messageCreate', (message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith(config.prefix)) return;

        commandHandler(message);
    });
};