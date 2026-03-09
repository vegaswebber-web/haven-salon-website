const axios = require('axios');
const querystring = require('querystring');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

function getAuthUrl(redirectUri, state) {
  const scope = ['user-read-playback-state','user-read-currently-playing'].join(' ');
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope,
    show_dialog: 'true',
    state,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function exchangeCode(code, redirectUri) {
  const data = querystring.stringify({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const resp = await axios.post('https://accounts.spotify.com/api/token', data, { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
  return resp.data; // contains access_token, refresh_token, expires_in
}

async function refreshToken(refreshToken) {
  const data = querystring.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken });
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const resp = await axios.post('https://accounts.spotify.com/api/token', data, { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
  return resp.data;
}

module.exports = { getAuthUrl, exchangeCode, refreshToken };
