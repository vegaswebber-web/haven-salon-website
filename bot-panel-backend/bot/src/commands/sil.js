module.exports = {
  name: 'sil',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply('❌ Bu komutu kullanmak için yetkiniz yok!');
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 99) {
      return message.reply('❌ 1-99 arasında bir sayı girin! Örnek: `.sil 5`');
    }

    try {
      // Silinecek mesajları önceden fetch et
      const messages = await message.channel.messages.fetch({ limit: amount });
      
      // Mesajları logla
      const LOG_CHANNEL_ID = '1469398509290655816';
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      
      if (logChannel && messages.size > 0) {
        const messageList = messages
          .map(m => `**${m.author?.username || 'Bilinmiyor'}**: ${m.content?.slice(0, 80) || '*Boş*'}`)
          .join('\n')
          .slice(0, 2048);

        const embed = {
          color: 0xFF6600,
          title: '🗑️ Toplu Mesaj Silindi (.sil komutu)',
          description: messageList || '*Mesajlar yüklenemeddi*',
          fields: [
            {
              name: 'Silinen Mesaj Sayısı',
              value: `${messages.size}`,
              inline: true
            },
            {
              name: '💬 Kanal',
              value: `<#${message.channelId}>`,
              inline: true
            },
            {
              name: '👤 Silen Kişi',
              value: `${message.author.username}`,
              inline: true
            }
          ],
          timestamp: new Date()
        };

        logChannel.send({ embeds: [embed] }).catch(() => {});
      }

      // Silme işlemini yap
      const deleted = await message.channel.bulkDelete(amount, true);
      message.channel.send(`✅ ${deleted.size} mesaj silindi!`).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 3000);
      }).catch(() => {});

    } catch (error) {
      console.error('Sil komutu hatası:', error);
      message.reply('❌ Mesajlar silinemedi!');
    }
  }
};
