module.exports = {
  name: 'unban',
  async execute(message, args, client) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ Bu komutu kullanmak için yetkiniz yok!');
    }

    if (!args.length) {
      return message.reply('❌ Lütfen bir User ID girin! Örnek: `.unban 123456789`');
    }

    try {
      await message.guild.bans.remove(args[0]);
      message.reply(`✅ Kullanıcı başarıyla banı kaldırıldı!`);
    } catch (error) {
      message.reply('❌ Ban kaldırılamadı!');
    }
  }
};
