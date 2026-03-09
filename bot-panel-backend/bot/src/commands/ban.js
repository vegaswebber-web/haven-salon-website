module.exports = {
  name: 'ban',
  async execute(message, args, client) {
    // Yetki kontrol et
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ Ban yetkisine sahip değilsiniz!');
    }

    if (!args.length) {
      return message.reply('❌ Kullanıcı IDsi girin! Örnek: `.ban 123456789`');
    }

    try {
      const userId = args[0];
      
      // ID geçerliliğini kontrol et
      if (!/^\d+$/.test(userId)) {
        return message.reply('❌ Geçersiz ID formatı!');
      }

      // Sunucu üyeleri arasında ara
      const member = await message.guild.members.fetch(userId).catch(() => null);
      
      if (!member) {
        // Üye değilse direkt ID ile ban et
        try {
          await message.guild.bans.create(userId, { reason: `${message.author.username} tarafından banlandı` });
          return message.channel.send(`✅ Kullanıcı (${userId}) başarıyla banlandı!`);
        } catch (error) {
          return message.reply('❌ Kullanıcı banlanamadı! ID geçerli mi kontrol et.');
        }
      }

      // Eğer bot kendi kendini banlamaya çalışırsa
      if (member.id === client.user.id) {
        return message.reply('❌ Kendimi ban edemem!');
      }

      // Eğer admin ise ban etme
      if (member.permissions.has('Administrator')) {
        return message.reply('❌ Admin kullanıcıları ban edemem!');
      }

      // Ban et
      await member.ban({ reason: `${message.author.username} tarafından banlandı` });
      message.channel.send(`✅ **${member.user.username}** başarıyla banlandı!`);

    } catch (error) {
      console.error('Ban error:', error);
      message.reply('❌ Bir hata oluştu!');
    }
  }
};
