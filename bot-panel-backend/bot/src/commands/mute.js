const mutedUsers = new Map();

module.exports = {
  name: 'mute',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('❌ Bu komutu kullanmak için yetkiniz yok!');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Bir kullanıcı etiketle! Örnek: `.mute @kullanıcı 10`');
    }

    const duration = parseInt(args[1]) || 5;

    try {
      await member.timeout(duration * 60 * 1000);
      message.reply(`🔇 ${member.user.username} ${duration} dakika susturuldu!`);
    } catch (error) {
      message.reply('❌ Kullanıcı susturulamadı!');
    }
  }
};
