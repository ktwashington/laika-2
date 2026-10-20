import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../auth/useAuth'; // your auth hook
import { usePlanner } from '../planner/PlannerContext';
import { createSession, updateSession } from './store';
import './Sessions.css';

type Status = { kind: 'ok' | 'error'; text: string } | null;

function suggestName(): string {
  const day = new Date().toLocaleDateString([], { weekday: 'long' });
  return `${day} study session`;
}

export default function SaveSessionPanel() {
  const { tasks, sound, playlistUrl, rhythm, activeSession, setActiveSession } = usePlanner();
  const { user } = useAuth();
  const userId: string | null = user?.id ?? null;

  const [name, setName] = useState(activeSession?.name ?? suggestName());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const data = { tasks, sound, playlistUrl, rhythm };

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setStatus(null);
    try {
      await action();
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  const trimmed = name.trim();

  function saveNew(e?: FormEvent) {
    e?.preventDefault();
    if (!trimmed) return;
    void run(async () => {
      const created = await createSession(userId, trimmed, data);
      setActiveSession({ id: created.id, name: created.name });
      setStatus({ kind: 'ok', text: `Saved as "${created.name}".` });
    });
  }

  function update() {
    if (!activeSession || !trimmed) return;
    void run(async () => {
      await updateSession(userId, activeSession.id, { name: trimmed, data });
      setActiveSession({ id: activeSession.id, name: trimmed });
      setStatus({ kind: 'ok', text: `Updated "${trimmed}".` });
    });
  }

  return (
    <form className="save" onSubmit={activeSession ? (e) => { e.preventDefault(); update(); } : saveNew}>
      <h2 className="save__title">{activeSession ? 'Save your changes' : 'Save this session'}</h2>
      <p className="save__sub">
        {activeSession
          ? `You're working on "${activeSession.name}".`
          : 'Give it a name so you can come back to it any time.'}
      </p>

      <label className="save__field">
        <span>Session name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
      </label>

      <div className="save__actions">
        {activeSession ? (
          <>
            <Button type="submit" disabled={busy || !trimmed}>
              {busy ? 'Saving…' : 'Update'}
            </Button>
            <Button variant="secondary" disabled={busy || !trimmed} onClick={() => saveNew()}>
              Save as new
            </Button>
          </>
        ) : (
          <Button type="submit" disabled={busy || !trimmed}>
            {busy ? 'Saving…' : 'Save session'}
          </Button>
        )}
        <Link to="/sessions" className="save__link">
          My sessions
        </Link>
      </div>

      {status && (
        <p className={status.kind === 'ok' ? 'save__ok' : 'save__error'} role={status.kind === 'ok' ? 'status' : 'alert'}>
          {status.text}
        </p>
      )}

      {!user && (
        <p className="save__hint">
          You're not logged in, so this is saved on this device only. <Link to="/login">Log in</Link> to keep your
          sessions on every device.
        </p>
      )}
    </form>
  );
}