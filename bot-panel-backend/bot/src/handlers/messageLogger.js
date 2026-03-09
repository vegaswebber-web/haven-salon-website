const LOG_CHANNEL_ID = '1469398509290655816';

module.exports = (client) => {
  // Mesaj silme kaydı
  client.on('messageDelete', async (message) => {
    // Bot mesajlarını logla
    
    try {
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      if (!logChannel) return;

      const embed = {
        color: 0xFF0000,
        title: '🗑️ Mesaj Silindi',
        description: message.content?.slice(0, 2048) || '*İçeri boş veya yüklenemeddi*',
        fields: [
          {
            name: '👤 Yazar',
            value: `${message.author?.username || message.authorId || 'Bilinmiyor'}`,
            inline: true
          },
          {
            name: '💬 Kanal',
            value: `<#${message.channelId}>`,
            inline: true
          },
          {
            name: 'Mesaj ID',
            value: `${message.id}`,
            inline: false
          },
          {
            name: '⏰ Saat',
            value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`,
            inline: false
          }
        ],
        timestamp: new Date()
      };

      logChannel.send({ embeds: [embed] }).catch(err => {
        console.log('Log kanal gönderme hatası:', err.message);
      });
    } catch (error) {
      console.error('Message delete log error:', error);
    }
  });

  // Toplu mesaj silme kaydı
  client.on('messageDeleteBulk', async (messages) => {
    try {
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      if (!logChannel) return;

      const messageList = messages
        .map(m => `**${m.author?.username || 'Bilinmiyor'}**: ${m.content?.slice(0, 100) || '*Boş*'}`)
        .join('\n')
        .slice(0, 2048);

      const embed = {
        color: 0xFF6600,
        title: '🗑️ Toplu Mesaj Silindi',
        description: messageList || '*Mesajlar yüklenemeddi*',
        fields: [
          {
            name: 'Silinen Mesaj Sayısı',
            value: `${messages.size}`,
            inline: true
          },
          {
            name: '💬 Kanal',
            value: `<#${messages.firstKey() ? (await client.channels.fetch(messages.first().channelId)).id : 'Bilinmiyor'}>`,
            inline: true
          }
        ],
        timestamp: new Date()
      };

      logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      console.error('Bulk message delete log error:', error);
    }
  });

  // Mesaj düzenleme kaydı
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    try {
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      if (!logChannel) return;

      const embed = {
        color: 0xFFA500,
        title: '✏️ Mesaj Düzenlendi',
        fields: [
          {
            name: '📝 Önceki İçerik',
            value: oldMessage.content?.slice(0, 1024) || '*Boş*',
            inline: false
          },
          {
            name: '📝 Yeni İçerik',
            value: newMessage.content?.slice(0, 1024) || '*Boş*',
            inline: false
          },
          {
            name: '👤 Yazar',
            value: `${oldMessage.author?.username || 'Bilinmiyor'}`,
            inline: true
          },
          {
            name: '💬 Kanal',
            value: `<#${oldMessage.channelId}>`,
            inline: true
          },
          {
            name: '⏰ Saat',
            value: `<t:${Math.floor(oldMessage.createdTimestamp / 1000)}:F>`,
            inline: false
          }
        ],
        timestamp: new Date()
      };

      logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      console.error('Message update log error:', error);
    }
  });
};
