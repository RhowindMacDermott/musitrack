// Spotify API integration service

const clientId = 'f8c7759f93dd494ebdd109bccbb2df9d'; // Your Spotify client ID
const redirectUri = 'https://rhowindmacdermott.github.io/musitrack/'; // GitHub Pages URL
const scopes = [
  'user-read-private',
  'user-read-email',
  'user-read-recently-played',
  'user-top-read',
  'playlist-read-private',
  'user-library-read',
].join(' ');

function getAuthUrl() {
  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const url = new URL(authEndpoint);
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('scope', scopes);
  url.searchParams.append('response_type', 'token');
  url.searchParams.append('show_dialog', 'true');
  return url.toString();
}

function getAccessTokenFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

async function fetchFromSpotify(endpoint, accessToken) {
  const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }
  return response.json();
}

async function getUserProfile(accessToken) {
  return fetchFromSpotify('me', accessToken);
}

async function getUserTopTracks(accessToken) {
  return fetchFromSpotify('me/top/tracks?limit=20', accessToken);
}

async function getUserRecentlyPlayed(accessToken) {
  return fetchFromSpotify('me/player/recently-played?limit=20', accessToken);
}

async function getRecommendations(accessToken, seedTracks) {
  const seedParam = seedTracks.slice(0, 5).join(',');
  return fetchFromSpotify(`recommendations?seed_tracks=${seedParam}&limit=10`, accessToken);
}

export {
  getAuthUrl,
  getAccessTokenFromUrl,
  getUserProfile,
  getUserTopTracks,
  getUserRecentlyPlayed,
  getRecommendations,
};
