const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = (() => {
  try {
    return require('@napi-rs/canvas');
  } catch (e) {
    // let require fail later when used
    return require('@napi-rs/canvas');
  }
})();

module.exports = {
  name: 'spo',
  description: 'Send currently playing Spotify songs from users as PNG (presence-only).',
  execute: async (message, args) => {
    if (!message.guild) return;

    // fetch member to ensure presence is available
    let member;
    try {
      member = await message.guild.members.fetch(message.author.id);
    } catch (e) {
      return message.reply('Kullanıcı alınamadı. Tekrar deneyin.');
    }

    const spotify = member.presence?.activities?.find(a => a.name === 'Spotify');
    if (!spotify) {
      return message.reply("Spotify'da bir şey dinlemiyorsun veya Discord'da Spotify activity'n kapalı.");
    }

    // extract info from presence
    const trackName = spotify.details || 'Bilinmeyen parça';
    const artist = spotify.state || 'Bilinmeyen sanatçı';
    const album = (spotify.assets && spotify.assets.largeText) || '';
    const start = spotify.timestamps?.start || null;
    const end = spotify.timestamps?.end || null;

    // compute current progress and total
    let current = 0; let total = 0;
    try {
      if (start && end) {
        // Discord sometimes provides in seconds; ensure milliseconds
        const norm = v => (v && v < 1e12 ? v * 1000 : v);
        const s = norm(start);
        const e = norm(end);
        current = Math.max(0, Date.now() - s);
        total = Math.max(1, e - s);
      }
    } catch (e) {}

    // album art URL from presence.largeImage (slice off "spotify:")
    let albumArtURL = null;
    try {
      const large = spotify.assets && spotify.assets.largeImage;
      if (large) albumArtURL = `https://i.scdn.co/image/${large.slice(8)}`;
    } catch (e) { albumArtURL = null; }

    // build canvas
    try {
      const width = 800; const height = 300;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // background
      ctx.fillStyle = '#1DB954';
      ctx.fillRect(0, 0, width, height);

      // album art
      if (albumArtURL) {
        try {
          const img = await loadImage(albumArtURL);
          ctx.drawImage(img, 20, 20, 260, 260);
        } catch (e) {
          ctx.fillStyle = '#00000033';
          ctx.fillRect(20, 20, 260, 260);
        }
      } else {
        ctx.fillStyle = '#00000033';
        ctx.fillRect(20, 20, 260, 260);
      }

      // text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 40px Arial';
      const title = trackName;
      // wrap or truncate title
      let drawTitle = title;
      const maxTitleWidth = 470;
      while (ctx.measureText(drawTitle).width > maxTitleWidth && drawTitle.length > 0) drawTitle = drawTitle.slice(0, -1);
      if (drawTitle !== title) drawTitle = drawTitle.slice(0, -3) + '...';
      ctx.fillText(drawTitle, 300, 80);

      ctx.font = '30px Arial';
      ctx.fillText(artist, 300, 120);

      // progress bar
      const barWidth = 450;
      const progressWidth = total > 0 ? Math.max(0, Math.min(barWidth, Math.round((current / total) * barWidth))) : 0;
      ctx.fillStyle = '#FFFFFF33';
      ctx.fillRect(300, 200, barWidth, 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(300, 200, progressWidth, 10);

      // times
      ctx.font = '20px Arial';
      const fmt = ms => {
        const t = Math.floor(ms / 1000);
        const mm = Math.floor(t / 60).toString();
        const ss = (t % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
      };
      ctx.fillText(fmt(current), 300, 240);
      ctx.fillText(fmt(total), 720, 240);

      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'spotify.png' });
      await message.reply({ files: [attachment] });
      return;
    } catch (err) {
      console.error('spo canvas error', err?.message || err);
      return message.reply("Spotify'da bir şey dinliyorsun ama görsel oluşturulamadı.");
    }
  }
};
