import { Message } from 'discord.js';

export const deleteMessages = async (message: Message, args: string[]) => {
    if (!message.member?.permissions.has('MANAGE_MESSAGES')) {
        return message.reply("You don't have permission to delete messages.");
    }

    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.reply('Please provide a number between 1 and 100.');
    }

    try {
        const fetched = await message.channel.messages.fetch({ limit: amount });
        await message.channel.bulkDelete(fetched);
        message.channel.send(`Deleted ${fetched.size} messages.`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to delete messages in this channel.');
    }
};