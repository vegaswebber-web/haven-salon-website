import { Message } from 'discord.js';

export const helpCommand = (message: Message) => {
    const commands = [
        { name: '.music', description: 'Play a song from YouTube or Spotify.' },
        { name: '.avatar', description: 'Display a user\'s profile picture.' },
        { name: '.ban', description: 'Ban a user from the server.' },
        { name: '.delete', description: 'Delete a specified number of messages.' },
        { name: '.unban', description: 'Unban a user from the server.' },
        { name: '.lock', description: 'Lock the current channel.' },
        { name: '.help', description: 'Display this help message.' },
        { name: '.mute', description: 'Temporarily mute a user.' },
    ];

    const helpMessage = commands.map(cmd => `${cmd.name}: ${cmd.description}`).join('\n');
    
    message.channel.send(`**Available Commands:**\n${helpMessage}`);
};