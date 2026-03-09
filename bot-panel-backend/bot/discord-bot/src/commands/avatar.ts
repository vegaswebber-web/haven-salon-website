import { Message } from 'discord.js';

export const avatarCommand = async (message: Message, args: string[]) => {
    const userId = args[0] || message.author.id;
    const user = message.guild?.members.cache.get(userId)?.user || await message.client.users.fetch(userId);

    if (user) {
        message.channel.send(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    } else {
        message.channel.send('User not found.');
    }
};