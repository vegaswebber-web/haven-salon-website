module.exports = {
  name: 'avatar',
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('❌ Lütfen bir User ID girin! Örnek: `.avatar 123456789`');
    }

    try {
      const user = await client.users.fetch(args[0]);
      const embed = {
        color: 0x0099ff,
        title: `${user.username}'ın Avatarı`,
        image: {
          url: user.displayAvatarURL({ size: 512 })
        }
      };
      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('❌ Kullanıcı bulunamadı!');
    }
  }
};
