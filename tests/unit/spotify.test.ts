import { describe, test, expect } from 'vitest';
import { getPlaylistId, embedUrl } from '../../src/planner/spotify';

describe('getPlaylistId', () => {
  test('extracts playlist ID from a valid Spotify URL', () => {
    const url = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123';
    expect(getPlaylistId(url)).toBe('37i9dQZF1DXcBWIGoYBM5M');
  });

  test('returns null for an invalid Spotify URL', () => {
    const url = 'https://example.com/not-a-spotify-url';
    expect(getPlaylistId(url)).toBeNull();
  });
});

describe('embedUrl', () => {
  test('generates the correct embed URL for a given playlist ID', () => {
    const id = '37i9dQZF1DXcBWIGoYBM5M';
    expect(embedUrl(id)).toBe('https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0');
  });
});