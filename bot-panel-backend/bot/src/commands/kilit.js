module.exports = {
  name: 'kilit',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply('❌ Bu komutu kullanmak için yetkiniz yok!');
    }

    const channel = message.channel;
    const isLocked = channel.permissionOverwrites.cache.has(message.guild.id);

    try {
      if (isLocked) {
        await channel.permissionOverwrites.delete(message.guild.id);
        message.reply('🔓 Kanal açıldı!');
      } else {
        await channel.permissionOverwrites.create(message.guild.id, {
          SendMessages: false
        });
        message.reply('🔒 Kanal kilitlendi!');
      }
    } catch (error) {
      message.reply('❌ Kanal kilidi değiştirilemedi!');
    }
  }
};
