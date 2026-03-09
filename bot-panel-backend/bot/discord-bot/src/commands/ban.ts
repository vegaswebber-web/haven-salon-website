import { CommandInteraction, GuildMember } from 'discord.js';

export const banUser = async (interaction: CommandInteraction) => {
    const member = interaction.options.getMember('user') as GuildMember;

    if (!member) {
        return interaction.reply('Please specify a valid user to ban.');
    }

    try {
        await member.ban();
        return interaction.reply(`${member.user.tag} has been banned.`);
    } catch (error) {
        console.error(error);
        return interaction.reply('I was unable to ban the member. Please check my permissions and try again.');
    }
};