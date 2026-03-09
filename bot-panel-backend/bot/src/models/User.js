const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(process.cwd(), 'data', 'users.sqlite3');
const fs = require('fs');
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    spotify_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER
  )`);
});

function getByDiscordId(discordId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE discord_id = ?', [discordId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function upsertTokens(discordId, spotifyId, accessToken, refreshToken, expiresAt) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO users (discord_id, spotify_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(discord_id) DO UPDATE SET spotify_id=excluded.spotify_id, access_token=excluded.access_token, refresh_token=excluded.refresh_token, expires_at=excluded.expires_at`,
      [discordId, spotifyId, accessToken, refreshToken, expiresAt], function(err) {
        if (err) return reject(err);
        resolve(true);
      });
  });
}

module.exports = { getByDiscordId, upsertTokens };
