import { CommandInteraction, GuildMember } from 'discord.js';
import ytdl from 'ytdl-core';
import { getVoiceConnection, createAudioPlayer, createAudioResource } from '@discordjs/voice';

export const musicCommand = async (interaction: CommandInteraction) => {
    const { options } = interaction;
    const songInput = options.getString('song');

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply('You need to be in a voice channel to play music!');
    }

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.reply('Connecting to the voice channel...');
        const newConnection = await voiceChannel.join();
        playSong(newConnection, songInput);
    } else {
        playSong(connection, songInput);
    }
};

const playSong = (connection: any, songInput: string) => {
    const player = createAudioPlayer();
    const resource = createAudioResource(ytdl(songInput, { filter: 'audioonly' }));

    player.play(resource);
    connection.subscribe(player);

    player.on('finish', () => {
        connection.disconnect();
    });
};