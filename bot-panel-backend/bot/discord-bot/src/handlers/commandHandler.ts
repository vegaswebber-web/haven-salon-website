import { Client, Message } from 'discord.js';
import { commands } from '../commands/index';

const commandPrefix = '.';

export const commandHandler = (client: Client) => {
    client.on('messageCreate', (message: Message) => {
        if (!message.content.startsWith(commandPrefix) || message.author.bot) return;

        const args = message.content.slice(commandPrefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (commandName && commands[commandName]) {
            commands[commandName](message, args);
        }
    });
};