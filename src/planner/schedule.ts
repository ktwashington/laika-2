import type { Block, BlockKind, Rhythm, Task } from './types';

export function formatMinutes(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function nextQuarterHour(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function startDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function generateSchedule(tasks: Task[], rhythm: Rhythm): Block[] {
    const sorted = [...tasks].sort((a, b) => {
    const da = a.due || '9999-12-31';
    const db = b.due || '9999-12-31';
    return da < db ? -1 : da > db ? 1 : 0;
  });

  const chunks: { title: string; minutes: number }[] = [];
  for (const task of sorted) {
    const parts = Math.ceil(task.minutes / rhythm.focusMinutes);
    let remaining = task.minutes;
    for (let i = 0; i < parts; i++) {
      const minutes = Math.min(rhythm.focusMinutes, remaining);
      remaining -= minutes;
      chunks.push({
        title: parts > 1 ? `${task.title} (${i + 1}/${parts})` : task.title,
        minutes,
      });
    }
  }

   const blocks: Block[] = [];
  let cursor = startDate(rhythm.startTime);

  const add = (kind: BlockKind, label: string, minutes: number) => {
    const start = cursor;
    const end = new Date(start.getTime() + minutes * 60_000);
    blocks.push({ id: `${kind}-${blocks.length}`, kind, label, start, end, minutes });
    cursor = end;
  };

  let focusCount = 0;
  chunks.forEach((chunk, i) => {
    add('focus', chunk.title, chunk.minutes);
    focusCount++;

    const isLast = i === chunks.length - 1;
    if (!isLast) {
      if (focusCount % rhythm.longBreakEvery === 0) {
        add('long-break', 'Long break', rhythm.longBreak);
      } else {
        add('break', 'Short break', rhythm.shortBreak);
      }
    }
  });

  return blocks;
}