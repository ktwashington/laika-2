
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../auth/useAuth';
import { usePlanner } from '../PlannerContext';
import { formatMinutes, generateSchedule } from '../schedule';
import { playSound, unlockAudio } from '../sounds';
import { embedUrl, getPlaylistId } from '../spotify';

const RING_R = 90;
const RING_C = 2 * Math.PI * RING_R;

const KIND_LABEL = {
  focus: 'Focus',
  break: 'Break',
  'long-break': 'Long break',
} as const;

export default function FocusPage() {
  const { tasks, setTasks, sound, playlistUrl, rhythm } = usePlanner();
  const { user } = useAuth();
  const navigate = useNavigate();

  const blocks = useMemo(
    () => generateSchedule(tasks, rhythm),
    [tasks, rhythm]
  );

  const playlistId = getPlaylistId(playlistUrl);
  const completionKey = `laika:completed-sessions:${user?.id ?? 'guest'}`;

  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [remaining, setRemaining] = useState(
    () => (blocks[0] ? blocks[0].minutes * 60_000 : 0)
  );

  const endAtRef = useRef(0);
  const completionRecordedRef = useRef(false);

  const finished = index >= blocks.length;
  const current = blocks[index];
  const next = blocks[index + 1];

  // Record a completed schedule once, even if React rerenders.
  const recordCompletedSession = useCallback(() => {
    if (completionRecordedRef.current) return;

    completionRecordedRef.current = true;

    try {
      const currentCount = Number(
        localStorage.getItem(completionKey) ?? '0'
      );

      localStorage.setItem(
        completionKey,
        String(currentCount + 1)
      );
    } catch {
      // The timer can still finish if browser storage is unavailable.
    }
  }, [completionKey]);

  // Jump to a block and optionally start its countdown.
  const goTo = useCallback(
    (target: number, run: boolean) => {
      if (target >= blocks.length) {
        setIndex(blocks.length);
        setRemaining(0);
        setRunning(false);
        return;
      }

      const ms = blocks[target].minutes * 60_000;

      setIndex(target);
      setRemaining(ms);
      endAtRef.current = Date.now() + ms;
      setRunning(run);
    },
    [blocks]
  );

  // When a block ends, play the sound and advance.
  const advance = useCallback(() => {
    playSound(sound);

    // Count only when the last block finishes naturally.
    if (index === blocks.length - 1) {
      recordCompletedSession();
    }

    goTo(index + 1, autoStart);
  }, [
    sound,
    goTo,
    index,
    autoStart,
    blocks.length,
    recordCompletedSession,
  ]);

  // Countdown uses the real clock to avoid background-tab drift.
  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      const left = endAtRef.current - Date.now();

      if (left <= 0) {
        window.clearInterval(id);
        advance();
      } else {
        setRemaining(left);
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [running, advance]);

  // Restore the original tab title when leaving the page.
  useEffect(() => {
    const original = document.title;

    return () => {
      document.title = original;
    };
  }, []);

  const secs = Math.ceil(remaining / 1000);
  const clock = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(
    secs % 60
  ).padStart(2, '0')}`;

  // Show the countdown in the browser tab title.
  useEffect(() => {
    if (current && !finished) {
      document.title = `${clock} · ${current.label}`;
    }
  }, [clock, current, finished]);

  function start() {
    unlockAudio();
    endAtRef.current = Date.now() + remaining;
    setRunning(true);
  }

  function pause() {
    setRemaining(Math.max(0, endAtRef.current - Date.now()));
    setRunning(false);
  }

  // All hooks are above this line, so early returns are safe.
  if (tasks.length === 0) {
    return <Navigate to="/plan/tasks" replace />;
  }

  if (finished) {
    const focusTotal = blocks
      .filter((block) => block.kind === 'focus')
      .reduce((sum, block) => sum + block.minutes, 0);

    return (
      <div className="focus__done">
        <h1 className="plan__title">All landed!</h1>

        <p className="plan__sub">
          You finished {formatMinutes(focusTotal)} of focused work. Go
          stretch, drink some water, and be proud of yourself.
        </p>

        <div className="plan__nav">
          <Button
            variant="ghost"
            onClick={() => navigate('/plan/schedule')}
          >
            Back to schedule
          </Button>

          <Button
            size="lg"
            onClick={() => {
              setTasks([]);
              navigate('/plan/tasks');
            }}
          >
            Plan something new
          </Button>
        </div>
      </div>
    );
  }

  const total = current.minutes * 60_000;
  const dashOffset = RING_C * (remaining / total);

  return (
    <>
      <div className="focus__top">
        <span className={`focus__pill focus__pill--${current.kind}`}>
          {KIND_LABEL[current.kind]}
        </span>

        <span className="plan__hint">
          Block {index + 1} of {blocks.length}
        </span>
      </div>

      <div className="focus__ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle
            cx="100"
            cy="100"
            r={RING_R}
            className="focus__track"
          />

          <circle
            cx="100"
            cy="100"
            r={RING_R}
            className={`focus__arc focus__arc--${current.kind}`}
            strokeDasharray={RING_C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
          />
        </svg>

        <div className="focus__center">
          <div role="timer" className="focus__time">
            {clock}
          </div>

          <div className="focus__label" aria-live="polite">
            {current.label}
          </div>
        </div>
      </div>

      <div className="focus__controls">
        {running ? (
          <Button size="lg" onClick={pause}>
            Pause
          </Button>
        ) : (
          <Button size="lg" onClick={start}>
            {remaining < total ? 'Resume' : 'Start'}
          </Button>
        )}

        <Button
          variant="secondary"
          size="lg"
          onClick={() => goTo(index + 1, false)}
        >
          Skip
        </Button>
      </div>

      <label className="focus__auto">
        <input
          type="checkbox"
          checked={autoStart}
          onChange={(event) => setAutoStart(event.target.checked)}
        />
        Start the next block automatically
      </label>

      <p className="focus__next">
        {next ? (
          <>
            Up next: <strong>{next.label}</strong> ·{' '}
            {formatMinutes(next.minutes)}
          </>
        ) : (
          'This is your last block. Almost there!'
        )}
      </p>

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

      <ol className="focus__list" aria-label="All blocks">
        {blocks.map((block, blockIndex) => (
          <li
            key={block.id}
            className={
              'focus__item' +
              (blockIndex < index ? ' focus__item--done' : '') +
              (blockIndex === index ? ' focus__item--now' : '')
            }
            aria-current={blockIndex === index ? 'step' : undefined}
          >
            <span>{block.label}</span>
            <span>{formatMinutes(block.minutes)}</span>
          </li>
        ))}
      </ol>

      <div className="plan__nav">
        <Button
          variant="ghost"
          onClick={() => navigate('/plan/schedule')}
        >
          Back to schedule
        </Button>
        <span />
      </div>
    </>
  );
}
