import { CommandInteraction, GuildMember } from 'discord.js';

export const unbanUser = async (interaction: CommandInteraction) => {
    const userId = interaction.options.getString('user_id');

    if (!userId) {
        return interaction.reply('Please provide a user ID to unban.');
    }

    try {
        await interaction.guild?.members.unban(userId);
        return interaction.reply(`User with ID ${userId} has been unbanned.`);
    } catch (error) {
        console.error(error);
        return interaction.reply('An error occurred while trying to unban the user.');
    }
};