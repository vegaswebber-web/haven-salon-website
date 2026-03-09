module.exports = {
  name: 'yardım',
  async execute(message, args, client) {
    const embed = {
      color: 0x00ff00,
      title: '📚 Zi Bot Yardım',
      description: 'Bot komutları:',
      fields: [
        {
          name: '🎵 `.müzik [ad/link]`',
          value: 'Müzik çalar',
          inline: false
        },
        {
          name: '👤 `.avatar [userID]`',
          value: 'Kullanıcı avatarını gösterir',
          inline: false
        },
        {
          name: '🚫 `.ban [userID]`',
          value: 'Kullanıcıyı sunucudan banlar',
          inline: false
        },
        {
          name: '✅ `.unban [userID]`',
          value: 'Banı kaldırır',
          inline: false
        },
        {
          name: '🗑️ `.sil [sayı]`',
          value: 'Mesaj siler',
          inline: false
        },
        {
          name: '🔒 `.kilit`',
          value: 'Kanalı kilitler/açar',
          inline: false
        },
        {
          name: '🔇 `.mute [@kullanıcı] [dakika]`',
          value: 'Kullanıcıyı susturur',
          inline: false
        }
      ]
    };
    message.reply({ embeds: [embed] });
  }
};
