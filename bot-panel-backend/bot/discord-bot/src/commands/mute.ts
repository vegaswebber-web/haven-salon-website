import { CommandInteraction, GuildMember } from 'discord.js';

export const muteUser = async (interaction: CommandInteraction) => {
    const member = interaction.options.getMember('user') as GuildMember;
    const duration = interaction.options.getInteger('duration');

    if (!member) {
        return interaction.reply('User not found.');
    }

    if (member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply('You cannot mute an administrator.');
    }

    await member.voice.setMute(true);
    await interaction.reply(`${member.displayName} has been muted for ${duration} minutes.`);

    setTimeout(async () => {
        await member.voice.setMute(false);
        await interaction.followUp(`${member.displayName} has been unmuted.`);
    }, duration * 60000);
};