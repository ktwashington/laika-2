import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { usePlanner } from '../PlannerContext';
import { SOUNDS, playSound } from '../sounds';

export default function SoundStep() {
  const { sound, setSound } = usePlanner();
  const navigate = useNavigate();

  return (
    <>
      <h1 className="plan__title">Pick your timer sound</h1>
      <p className="plan__sub">This plays when a focus block or a break ends.</p>

      <fieldset className="plan__fieldset plan__options">
        <legend className="sr-only">Timer sound</legend>
        {SOUNDS.map((s) => (
          <div key={s.id} className={'option' + (sound === s.id ? ' option--on' : '')}>
            <label className="option__label">
              <input
                type="radio"
                name="sound"
                value={s.id}
                checked={sound === s.id}
                onChange={() => {
                  setSound(s.id);
                  playSound(s.id);
                }}
              />
              <span>
                <span className="option__name">{s.label}</span>
                <span className="option__desc">{s.description}</span>
              </span>
            </label>
            {s.id !== 'none' && (
              <Button variant="ghost" size="sm" onClick={() => playSound(s.id)}>
                Preview
              </Button>
            )}
          </div>
        ))}
      </fieldset>

      <div className="plan__nav">
        <Button variant="ghost" onClick={() => navigate('/plan/tasks')}>
          Back
        </Button>
        <Button size="lg" onClick={() => navigate('/plan/music')}>
          Next: music
        </Button>
      </div>
    </>
  );
}