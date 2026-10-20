import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import { usePlanner } from '../PlannerContext';
import { formatMinutes } from '../schedule';

const PRESETS = [15, 30, 45, 60, 90];

export default function TasksStep() {
  const { tasks, setTasks } = usePlanner();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [due, setDue] = useState('');

  function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title: trimmed, minutes, due }]);
    setTitle('');
    setDue('');
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const total = tasks.reduce((sum, t) => sum + t.minutes, 0);

  return (
    <>
      <h1 className="plan__title">What's on your plate?</h1>
      <p className="plan__sub">Add each assignment and guess how long it'll take. A rough guess is fine.</p>
      <Link to="/sessions" className="plan__hint">Open a saved session</Link>

      <form className="plan__form" onSubmit={addTask}>
        <label className="plan__field">
          <span>Assignment</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Problem set 4"
            required
          />
        </label>

        <fieldset className="plan__field plan__fieldset">
          <legend>How long will it take?</legend>
          <div className="plan__chips">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                className={'chip' + (minutes === m ? ' chip--on' : '')}
                aria-pressed={minutes === m}
                onClick={() => setMinutes(m)}
              >
                {formatMinutes(m)}
              </button>
            ))}
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(5, Number(e.target.value) || 5))}
              aria-label="Custom minutes"
              className="chip__input"
            />
            <span className="plan__hint">min</span>
          </div>
        </fieldset>

        <label className="plan__field">
          <span>Due date (optional)</span>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>

        <Button type="submit" variant="secondary">
          Add assignment
        </Button>
      </form>

      {tasks.length > 0 && (
        <>
          <ul className="plan__list">
            {tasks.map((t) => (
              <li key={t.id} className="task">
                <div>
                  <div className="task__title">{t.title}</div>
                  <div className="task__meta">
                    {formatMinutes(t.minutes)}
                    {t.due && ` · due ${t.due}`}
                  </div>
                </div>
                <button
                  type="button"
                  className="task__remove"
                  onClick={() => removeTask(t.id)}
                  aria-label={`Remove ${t.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="plan__hint">
            {tasks.length} {tasks.length === 1 ? 'assignment' : 'assignments'} · {formatMinutes(total)} of focus time
          </p>
        </>
      )}

      <div className="plan__nav">
        <span />
        <Button size="lg" disabled={tasks.length === 0} onClick={() => navigate('/plan/sound')}>
          Next: timer sound
        </Button>
      </div>
    </>
  );
}