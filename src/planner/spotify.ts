// Accepts links like:
// https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123
export function getPlaylistId(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?playlist\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export function embedUrl(id: string): string {
  return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
}