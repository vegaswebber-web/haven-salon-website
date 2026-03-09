const axios = require('axios');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');
const spotifyAuth = require('../utils/spotifyAuth');
const canvasGen = require('../utils/canvasGenerator');
const User = require('../models/User');

// Simple per-user in-memory rate limiter (ms)
const RATE_LIMIT_MS = 5000;
const lastUsed = new Map();

module.exports = {
  name: 'spotify',
  description: 'Show currently playing Spotify track as a PNG card or prompt to connect Spotify.',
  execute: async (message, args, client) => {
    try {
      const discordId = message.author.id;

      // rate limit
      const prev = lastUsed.get(discordId) || 0;
      if (Date.now() - prev < RATE_LIMIT_MS) {
        return message.reply('Lütfen bekleyin — çok sık kullanıyorsunuz.');
      }
      lastUsed.set(discordId, Date.now());

      // allow mention: .spo @user
      const mentioned = message.mentions.members?.first();
      const target = mentioned ? mentioned.user : message.author;

      // If user has no linked Spotify, give auth URL
      const dbUser = await User.getByDiscordId(target.id);
      if (!dbUser || !dbUser.access_token) {
        // build auth url
        const redirect = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/spotify/callback';
        const url = spotifyAuth.getAuthUrl(redirect, target.id);
        return message.reply(`Spotify hesabınız bağlı değil. Bağlamak için bu bağlantıyı açın: ${url}`);
      }

      // Ensure token is valid / refresh if necessary
      let accessToken = dbUser.access_token;
      if (dbUser.expires_at && Date.now() > dbUser.expires_at - 60000) {
        const refreshed = await spotifyAuth.refreshToken(dbUser.refresh_token);
        if (refreshed && refreshed.access_token) {
          accessToken = refreshed.access_token;
          const expiresAt = Date.now() + (refreshed.expires_in * 1000);
          await User.upsertTokens(target.id, dbUser.spotify_id, refreshed.access_token, refreshed.refresh_token || dbUser.refresh_token, expiresAt);
        }
      }

      // Request currently playing track for the user
      const resp = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { additional_types: 'track' },
      });

      if (!resp.data || !resp.data.is_playing) {
        return message.reply('Kullanıcı şarkı dinlemiyor.');
      }

      const item = resp.data.item;
      if (!item) return message.reply('Çalan parça alınamadı.');

      const trackInfo = {
        title: item.name,
        artists: item.artists.map(a => a.name).join(', '),
        album: item.album.name,
        albumArt: item.album.images && item.album.images[0] ? item.album.images[0].url : null,
        progress_ms: resp.data.progress_ms || 0,
        duration_ms: item.duration_ms || 0,
      };

      // get user avatar
      const avatarUrl = target.displayAvatarURL({ extension: 'png', size: 128 });

      // generate PNG buffer
      const buffer = await canvasGen.generateNowPlayingCard({ track: trackInfo, user: target, avatarUrl });

      const attachment = new AttachmentBuilder(buffer, { name: 'now_playing.png' });
      await message.channel.send({ files: [attachment] });
    } catch (err) {
      console.error('spo command error', err?.message || err);
      try { message.reply('Bir hata oldu: ' + (err.message || 'bilinmeyen hata')); } catch(e) {}
    }
  }
};
