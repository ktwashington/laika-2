export type Task = {
    id: string;
    title: string;
    minutes: number;
    due: string;
};

export type SoundId = 'chime' | 'bell' | 'bubble' | 'none';

export type Rhythm = {
    focusMinutes: number;
    shortBreak: number;
    longBreak: number;
    longBreakEvery: number;
    startTime: string;
};

export type BlockKind = 'focus' | 'break' | 'long-break';

export type Block = {
    id: string;
    kind: BlockKind;
    label: string;
    start: Date;
    end: Date;
    minutes: number;
};

export type PlannerData = {
  tasks: Task[];
  sound: SoundId;
  playlistUrl: string;
  rhythm: Rhythm;
};

export type SavedSession = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: PlannerData;
};

export type ActiveSession = { id: string; name: string };