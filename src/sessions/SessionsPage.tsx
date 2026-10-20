import Navbar from '../components/LoggedInNav';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../auth/useAuth'; // your auth hook
import { usePlanner } from '../planner/PlannerContext';
import { formatMinutes } from '../planner/schedule';
import type { SavedSession } from '../planner/types';
import { deleteSession, listSessions, updateSession } from './store';
import './Sessions.css';

function totalMinutes(s: SavedSession): number {
  return (s.data.tasks ?? []).reduce((sum, t) => sum + t.minutes, 0);
}

function savedOn(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SessionsPage() {
  const { user } = useAuth();
  const userId: string | null = user?.id ?? null;
  const { openSession, activeSession, setActiveSession } = usePlanner();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SavedSession[] | null>(null);
  const [error, setError] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSessions(null);
    listSessions(userId)
      .then((list) => !cancelled && setSessions(list))
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load your sessions.');
        setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function open(s: SavedSession) {
    openSession(s);
    navigate('/plan/schedule');
  }

  async function rename(e: FormEvent, s: SavedSession) {
    e.preventDefault();
    const next = renameValue.trim();
    if (!next) return;
    try {
      await updateSession(userId, s.id, { name: next });
      setSessions((list) => list?.map((x) => (x.id === s.id ? { ...x, name: next } : x)) ?? null);
      if (activeSession?.id === s.id) setActiveSession({ id: s.id, name: next });
      setRenamingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename that session.');
    }
  }

  async function remove(s: SavedSession) {
    try {
      await deleteSession(userId, s.id);
      setSessions((list) => list?.filter((x) => x.id !== s.id) ?? null);
      if (activeSession?.id === s.id) setActiveSession(null);
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete that session.');
    }
  }

  return (
    <main className="sessions">
      <Navbar />
      <div className="sessions__wrap">
        <div className="sessions__head">
          <h1 className="sessions__title">My study sessions</h1>
          <Button size="sm" href="/plan">
            New plan
          </Button>
        </div>

        {!user && (
          <p className="sessions__hint">
            These are saved on this device only. <Link to="/login">Log in</Link> to keep them everywhere.
          </p>
        )}

        {error && (
          <p className="sessions__error" role="alert">
            {error}
          </p>
        )}

        {sessions === null && <p className="sessions__hint">Loading…</p>}

        {sessions && sessions.length === 0 && !error && (
          <div className="sessions__empty">
            <h2>Nothing saved yet</h2>
            <p>Build a plan, then save it from the schedule page and it will show up here.</p>
            <Button onClick={() => navigate('/plan')}>Plan a session</Button>
          </div>
        )}

        <ul className="sessions__list">
          {sessions?.map((s) => {
            const isActive = activeSession?.id === s.id;
            return (
              <li key={s.id} className={'scard' + (isActive ? ' scard--active' : '')}>
                {renamingId === s.id ? (
                  <form className="scard__rename" onSubmit={(e) => rename(e, s)}>
                    <label className="sr-only" htmlFor={`rename-${s.id}`}>
                      Session name
                    </label>
                    <input
                      id={`rename-${s.id}`}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      maxLength={80}
                      autoFocus
                      required
                    />
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRenamingId(null)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div className="scard__main">
                    <div>
                      <h2 className="scard__name">
                        {s.name} {isActive && <span className="scard__badge">Open now</span>}
                      </h2>
                      <p className="scard__meta">
                        {(s.data.tasks ?? []).length} assignments · {formatMinutes(totalMinutes(s))} of focus ·
                        saved {savedOn(s.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {deletingId === s.id ? (
                  <div className="scard__actions" role="group" aria-label={`Delete ${s.name}?`}>
                    <span className="scard__confirm">Delete this session?</span>
                    <Button size="sm" onClick={() => remove(s)}>
                      Yes, delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>
                      Keep it
                    </Button>
                  </div>
                ) : (
                  renamingId !== s.id && (
                    <div className="scard__actions">
                      <Button size="sm" onClick={() => open(s)}>
                        Open
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setRenamingId(s.id);
                          setRenameValue(s.name);
                        }}
                      >
                        Rename
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingId(s.id)}>
                        Delete
                      </Button>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}