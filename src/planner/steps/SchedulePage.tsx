import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { usePlanner } from '../PlannerContext';
import { formatMinutes, formatTime, generateSchedule } from '../schedule';
import { playSound } from '../sounds';
import { embedUrl, getPlaylistId } from '../spotify';
import SaveSessionPanel from '../../sessions/SaveSessionPanel';

export default function SchedulePage() {
  const { tasks, sound, playlistUrl, rhythm, setRhythm } = usePlanner();
  const navigate = useNavigate();

  const blocks = useMemo(() => generateSchedule(tasks, rhythm), [tasks, rhythm]);
  const playlistId = getPlaylistId(playlistUrl);

  // if the page was refreshed, state is gone, so send them back to the start
  if (tasks.length === 0) return <Navigate to="/plan/tasks" replace />;

  const focusTotal = blocks.filter((b) => b.kind === 'focus').reduce((s, b) => s + b.minutes, 0);
  const finish = blocks[blocks.length - 1].end;

  const setNum = (key: 'focusMinutes' | 'shortBreak' | 'longBreak', min: number, max: number) =>
    (value: string) =>
      setRhythm((r) => ({ ...r, [key]: Math.min(max, Math.max(min, Number(value) || min)) }));

  return (
    <>
      <h1 className="plan__title">Your study schedule</h1>
      <p className="plan__sub">
        {formatMinutes(focusTotal)} of focus time, done by {formatTime(finish)}. Tweak the rhythm below and it
        updates instantly.
      </p>

      <div className="plan__rhythm">
        <label className="plan__field">
          <span>Start time</span>
          <input
            type="time"
            value={rhythm.startTime}
            onChange={(e) => setRhythm((r) => ({ ...r, startTime: e.target.value || r.startTime }))}
          />
        </label>
        <label className="plan__field">
          <span>Focus (min)</span>
          <input
            type="number" min={10} max={90} step={5}
            value={rhythm.focusMinutes}
            onChange={(e) => setNum('focusMinutes', 10, 90)(e.target.value)}
          />
        </label>
        <label className="plan__field">
          <span>Short break</span>
          <input
            type="number" min={1} max={30}
            value={rhythm.shortBreak}
            onChange={(e) => setNum('shortBreak', 1, 30)(e.target.value)}
          />
        </label>
        <label className="plan__field">
          <span>Long break</span>
          <input
            type="number" min={5} max={60} step={5}
            value={rhythm.longBreak}
            onChange={(e) => setNum('longBreak', 5, 60)(e.target.value)}
          />
        </label>
      </div>

      <ol className="plan__blocks">
        {blocks.map((b) => (
          <li key={b.id} className={`block block--${b.kind}`}>
            <span className="block__time">{formatTime(b.start)}</span>
            <span className="block__label">{b.label}</span>
            <span className="block__len">{formatMinutes(b.minutes)}</span>
          </li>
        ))}
      </ol>

      {playlistId && (
        <iframe
          title="Your Spotify playlist"
          className="plan__embed"
          src={embedUrl(playlistId)}
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
        <SaveSessionPanel />
        <div className="plan__nav">
            <Button variant="ghost" onClick={() => navigate('/plan/music')}>
                Back
            </Button>
            <div className="plan__nav-group">
                <Button variant="secondary" onClick={() => playSound(sound)} disabled={sound === 'none'}>
                Test sound
                </Button>
                <Button size="lg" onClick={() => navigate('/plan/focus')}>
                Start session
                </Button>
            </div>
        </div>
    </>
  );
}