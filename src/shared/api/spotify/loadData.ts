import * as d3 from 'd3';

interface Song {
  Track: string;
  Artist: string;
  'Track Score': number;
  'Spotify Streams': number;
  'Release Date': number;
  'Album Name'?: string;
}

export const loadData = async (): Promise<Song[]> => {
  const data: Song[] = await d3.csv(
    'src/assets/data/Most Streamed Spotify Songs 2024.csv',
    (d: Record<string, string>) => ({
      Track: d.Track,
      Artist: d.Artist,
      'Track Score': +d['Track Score'],
      'Spotify Streams': +d['Spotify Streams'],
      'Release Date': +d['Release Date'],
      'Album Name': d['Album Name'],
    })
  );
  return data;
};
