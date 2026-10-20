import { createContext, useContext, useEffect, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { ActiveSession, Rhythm, SavedSession, SoundId, Task } from './types';
import { nextQuarterHour } from './schedule';

type PlannerState = {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  sound: SoundId;
  setSound: Dispatch<SetStateAction<SoundId>>;
  playlistUrl: string;
  setPlaylistUrl: Dispatch<SetStateAction<string>>;
  rhythm: Rhythm;
  setRhythm: Dispatch<SetStateAction<Rhythm>>;
  activeSession: ActiveSession | null;
  setActiveSession: Dispatch<SetStateAction<ActiveSession | null>>;
  openSession: (s: SavedSession) => void;
};

type Saved = Partial<{
  tasks: Task[];
  sound: SoundId;
  playlistUrl: string;
  rhythm: Rhythm;
  activeSession: ActiveSession | null;
}>;

const STORAGE_KEY = 'laika:planner';

const defaultRhythm = (): Rhythm => ({
  focusMinutes: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakEvery: 4,
  startTime: nextQuarterHour(),
});

function readSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : {};
  } catch {
    return {};
  }
}

const PlannerContext = createContext<PlannerState | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [saved] = useState(readSaved);

  const [tasks, setTasks] = useState<Task[]>(saved.tasks ?? []);
  const [sound, setSound] = useState<SoundId>(saved.sound ?? 'chime');
  const [playlistUrl, setPlaylistUrl] = useState(saved.playlistUrl ?? '');
  const [rhythm, setRhythm] = useState<Rhythm>({
    ...defaultRhythm(),
    ...saved.rhythm,
    startTime: nextQuarterHour(),
  });
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(saved.activeSession ?? null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, sound, playlistUrl, rhythm, activeSession })
      );
    } catch {
      /* storage blocked: the planner still works, it just won't persist */
    }
  }, [tasks, sound, playlistUrl, rhythm, activeSession]);

  function openSession(s: SavedSession) {
    setTasks(s.data.tasks ?? []);
    setSound(s.data.sound ?? 'chime');
    setPlaylistUrl(s.data.playlistUrl ?? '');
    setRhythm({ ...defaultRhythm(), ...s.data.rhythm, startTime: nextQuarterHour() });
    setActiveSession({ id: s.id, name: s.name });
  }

  return (
    <PlannerContext.Provider
      value={{
        tasks, setTasks, sound, setSound, playlistUrl, setPlaylistUrl,
        rhythm, setRhythm, activeSession, setActiveSession, openSession,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner(): PlannerState {
  const value = useContext(PlannerContext);
  if (!value) throw new Error('usePlanner must be used inside <PlannerProvider>');
  return value;
}