import { Outlet, useLocation } from 'react-router-dom';
import { PlannerProvider } from './PlannerContext';
import './Planner.css';
import Navbar from '../components/LoggedInNav';

const STEPS = [
  { path: 'tasks', label: 'Tasks' },
  { path: 'sound', label: 'Sound' },
  { path: 'music', label: 'Music' },
  { path: 'schedule', label: 'Schedule' },
];

export default function PlannerLayout() {
  const { pathname } = useLocation();
  const onFocus = pathname.endsWith('/focus');
  const current = STEPS.findIndex((s) => pathname.endsWith(s.path));

  return (
    <PlannerProvider>
      <main className="plan">
        <Navbar />
        {!onFocus && (
        <ol className="plan__steps" aria-label="Progress">
          {STEPS.map((step, i) => (
            <li
              key={step.path}
              className={
                'plan__step' +
                (i === current ? ' plan__step--current' : '') +
                (i < current ? ' plan__step--done' : '')
              }
              aria-current={i === current ? 'step' : undefined}
            >
              <span className="plan__step-num">{i + 1}</span>
              {step.label}
            </li>
          ))}
        </ol>
        )}

        <section className={'plan__card' + (onFocus ? ' plan__card--wide' : '')}>
            <Outlet />
        </section>
      </main>
    </PlannerProvider>
  );
}