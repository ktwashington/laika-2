import type { SoundId } from './types';

export const SOUNDS: { id: SoundId; label: string; description: string }[] = [
  { id: 'chime', label: 'Soft chime', description: 'Two gentle rising notes' },
  { id: 'bell', label: 'Little bell', description: 'A warm, ringing tone' },
  { id: 'bubble', label: 'Bubble pop', description: 'A quick, playful blip' },
  { id: 'none', label: 'Silent', description: 'No sound, just the visual' },
];

let ctx: AudioContext | null = null;

function tone(
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  endFreq?: number
) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t0 = ctx.currentTime + start;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function playSound(id: SoundId) {
  if (id === 'none') return;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();

  if (id === 'chime') {
    tone(880, 0, 0.6);
    tone(1320, 0.18, 0.9);
  } else if (id === 'bell') {
    tone(660, 0, 1.6, 'triangle');
    tone(1320, 0, 1.0, 'sine');
  } else if (id === 'bubble') {
    tone(400, 0, 0.18, 'sine', 900);
  }
}

export function unlockAudio() {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
}