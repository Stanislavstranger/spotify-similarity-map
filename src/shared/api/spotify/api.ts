import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

const encodeBase64 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

let accessToken = '';

const getAccessToken = async () => {
  if (accessToken) return accessToken;

  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'client_credentials',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodeBase64(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
    }
  );

  accessToken = response.data.access_token;
  return accessToken;
};

export const getTrackPreviewUrl = async (
  trackId: string
): Promise<string | null> => {
  const token = await getAccessToken();
  const response = await axios.get(`${SPOTIFY_API_URL}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.preview_url;
};

export const searchTrack = async (
  trackName: string,
  artistName: string
): Promise<string | null> => {
  const token = await getAccessToken();
  const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
    params: {
      q: `track:${trackName} artist:${artistName}`,
      type: 'track',
      limit: 1,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.data.tracks.items.length > 0) {
    return response.data.tracks.items[0].id;
  } else {
    return null;
  }
};
