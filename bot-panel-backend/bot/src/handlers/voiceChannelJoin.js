const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

const VOICE_CHANNEL_ID = '1420362388724776980';

module.exports = (client) => {
  client.once('ready', async () => {
    try {
      const voiceChannel = await client.channels.fetch(VOICE_CHANNEL_ID);
      
      if (!voiceChannel) {
        console.log('❌ Ses kanalı bulunamadı!');
        return;
      }

      if (voiceChannel.isVoiceBased()) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: true
        });

        // Bağlantı durumunu bekleme
        connection.on('error', error => {
          console.error('❌ Ses kanalı bağlantı hatası:', error.message);
        });

        console.log(`✅ Ses kanalına bağlandı: ${voiceChannel.name}`);
      }
    } catch (error) {
      console.error('Voice channel join error:', error);
    }
  });
};
