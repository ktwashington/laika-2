import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { usePlanner } from '../../planner/PlannerContext';
import type { SavedSession } from '../../planner/types';
import { listSessions } from '../../sessions/store';
import './Dashboard.css';

const quotes = [
  'Small steps still move you forward.',
  'You do not have to do everything today.',
  'Progress, not perfection.',
  'Start where you are. Use what you have.',
];

export default function Dashboard() {
  const { user } = useAuth();
  const { openSession } = usePlanner();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?.id ?? null;
  const completionKey = `laika:completed-sessions:${userId ?? 'guest'}`;
  const quote = quotes[new Date().getDate() % quotes.length];

  useEffect(() => {
    try {
      setCompleted(Number(localStorage.getItem(completionKey) ?? '0'));
    } catch {
      setCompleted(0);
    }
  }, [completionKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setLoading(true);
      setError('');

      try {
        const saved = await listSessions(userId);
        if (!cancelled) setSessions(saved);
      } catch {
        if (!cancelled) {
          setError('Could not load your saved sessions. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  function resumeSession(session: SavedSession) {
    openSession(session);
    navigate('/plan/tasks');
  }

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <Link to="/dashboard" className="dashboard-logo">
          <img src="/Favicon.png" className="dashboard-logo-img"/>
        </Link>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link to="/dashboard" className="dashboard-nav-link active">
            <span aria-hidden="true">⌂</span>
            Dashboard
          </Link>

          <Link to="/plan/tasks" className="dashboard-nav-link">
            <span aria-hidden="true">✎</span>
            Study planner
          </Link>

          <Link to="/sessions" className="dashboard-nav-link">
            <span aria-hidden="true">▤</span>
            My sessions
          </Link>

          <Link to="/plan/schedule" className="dashboard-nav-link">
            <span aria-hidden="true">◷</span>
            Schedule
          </Link>
        </nav>
        <Link to="/" className="dashboard-nav-link">
            <span aria-hidden="true">⎋</span>
            Log out
        </Link>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-mascot" aria-hidden="true">
            ☾
          </div>
          <p>Take it one step at a time.</p>
          <span>Your space to focus and grow.</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <p className="dashboard-eyebrow">YOUR SPACE</p>
          <h1>
            Welcome back<span>.</span>
          </h1>
          <p className="dashboard-subtitle">
            A little progress is still progress. What are we working on today?
          </p>
        </header>

        <section className="dashboard-stats" aria-label="Study statistics">
          <article className="stat-card stat-pink">
            <div className="stat-icon" aria-hidden="true">♡</div>
            <p className="stat-label">Completed sessions</p>
            <p className="stat-value">{completed}</p>
            <p className="stat-detail">Study sessions finished</p>
          </article>

          <article className="stat-card stat-blue">
            <div className="stat-icon" aria-hidden="true">▤</div>
            <p className="stat-label">Saved sessions</p>
            <p className="stat-value">{sessions.length}</p>
            <p className="stat-detail">Plans ready when you are</p>
          </article>

          <article className="stat-card stat-purple">
            <div className="stat-icon" aria-hidden="true">✧</div>
            <p className="stat-label">Tasks planned</p>
            <p className="stat-value">
              {sessions.reduce(
                (total, session) => total + session.data.tasks.length,
                0
              )}
            </p>
            <p className="stat-detail">Across your saved plans</p>
          </article>
        </section>

        <section className="dashboard-quote">
          <p className="dashboard-eyebrow">A LITTLE REMINDER</p>
          <blockquote>“{quote}”</blockquote>
          <p className="quote-author">A note for your study journey</p>
          <div className="quote-decoration" />
        </section>

        <div className="dashboard-content">
          <section className="dashboard-panel">
            <div className="panel-heading">
              <h2>Your saved sessions</h2>
              <Link to="/sessions">View all</Link>
            </div>

            {loading ? (
              <p className="dashboard-subtitle">Loading your sessions...</p>
            ) : error ? (
              <p role="alert" className="dashboard-subtitle">{error}</p>
            ) : sessions.length === 0 ? (
              <div className="dashboard-empty">
                <p>You haven't saved any study plans yet.</p>
                <p className="dashboard-subtitle">
                  Create a plan and save it to find it here.
                </p>
              </div>
            ) : (
              <div className="session-list">
                {sessions.slice(0, 3).map((session) => (
                  <article className="session-item" key={session.id}>
                    <div className="session-info">
                      <h3>{session.name}</h3>
                      <p>
                        Updated{' '}
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                      <span className="session-status saved">
                        {session.data.tasks.length}{' '}
                        {session.data.tasks.length === 1 ? 'task' : 'tasks'} ·
                        {' '}Saved plan
                      </span>
                    </div>

                    <button
                      type="button"
                      className="session-button"
                      onClick={() => resumeSession(session)}
                    >
                      Open plan
                    </button>
                  </article>
                ))}
              </div>
            )}

            <Link to="/plan/tasks" className="create-session-link">
              + Create a new study plan
            </Link>
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading">
              <h2>Quick actions</h2>
            </div>

            <div className="quick-action-list">
              <Link to="/plan/tasks" className="quick-action primary">
                <span aria-hidden="true">✎</span>
                Create a study plan
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/sessions" className="quick-action">
                <span aria-hidden="true">▤</span>
                Browse saved sessions
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/plan/schedule" className="quick-action">
                <span aria-hidden="true">◷</span>
                View your schedule
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/plan/sound" className="quick-action">
                <span aria-hidden="true">♫</span>
                Set your focus sounds
                <span className="action-arrow">→</span>
              </Link>
            </div>

            <div className="dashboard-reminder">
              <h3>Remember to take breaks</h3>
              <p>
                You don't have to finish everything at once. Choose one task,
                take it at your own pace, and give yourself time to recharge.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
