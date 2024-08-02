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

  try {
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
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
};

export const getTrackPreviewUrl = async (
  trackId: string
): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) {
    console.error('Failed to get access token');
    return null;
  }

  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.preview_url;
  } catch (error) {
    console.error('Error fetching track preview URL:', error);
    return null;
  }
};

export const searchTrack = async (
  trackName: string,
  artistName: string
): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) {
    console.error('Failed to get access token');
    return null;
  }

  try {
    const response = await axios.get(
      `${SPOTIFY_API_URL}/search?query=remaster%2520track%3A${trackName}%2520artist%3A${artistName.split(' ')[0]}%2520${artistName.split(' ')[1]}&type=track&locale=en-US%2Cen%3Bq%3D0.9%2Cru%3Bq%3D0.8%2Ctr%3Bq%3D0.7&offset=0&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.tracks.items.length > 0) {
      return response.data.tracks.items[0].id;
    } else {
      console.log('No tracks found');
      return null;
    }
  } catch (error) {
    console.error('Error searching for track:', error);
    return null;
  }
};
