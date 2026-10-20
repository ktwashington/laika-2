import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { usePlanner } from '../PlannerContext';
import { embedUrl, getPlaylistId } from '../spotify';

export default function MusicStep() {
  const { playlistUrl, setPlaylistUrl } = usePlanner();
  const navigate = useNavigate();

  const id = getPlaylistId(playlistUrl);
  const invalid = playlistUrl.trim() !== '' && !id;

  return (
    <>
      <h1 className="plan__title">Add some study music</h1>
      <p className="plan__sub">
        In Spotify, open a playlist, choose Share, then Copy link, and paste it here.
      </p>

      <label className="plan__field">
        <span>Spotify playlist link</span>
        <input
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
          aria-invalid={invalid}
        />
      </label>

      {invalid && (
        <p className="plan__error" role="alert">
          That doesn't look like a Spotify playlist link yet.
        </p>
      )}

      {id && (
        <iframe
          title="Your Spotify playlist"
          className="plan__embed"
          src={embedUrl(id)}
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}

      <div className="plan__nav">
        <Button variant="ghost" onClick={() => navigate('/plan/sound')}>
          Back
        </Button>
        <Button size="lg" disabled={invalid} onClick={() => navigate('/plan/schedule')}>
          {id ? 'Next: my schedule' : 'Skip for now'}
        </Button>
      </div>
    </>
  );
}