import { describe, test, expect } from 'vitest';
import { formatMinutes, formatTime, nextQuarterHour, generateSchedule } from '../../src/planner/schedule';

describe('formatMinutes', () => {
  test('formats minutes correctly', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(75)).toBe('1h 15m');
    expect(formatMinutes(120)).toBe('2h');
  });
});

describe('formatTime', () => {
  test('formats time correctly', () => {
    const date = new Date();
    date.setHours(14, 30);
    expect(formatTime(date)).toMatch(/2:30\s*PM/i);
  });
});

describe('nextQuarterHour', () => {
  test('returns the next quarter hour', () => {
    const result = nextQuarterHour();
    const [hh, mm] = result.split(':').map(Number);
    expect(mm % 15).toBe(0);
  });
});

describe('generateSchedule', () => {
    test('generates a schedule correctly', () => {
        const task = [
            { id: 'task-1', title: 'Task 1', minutes: 30, due: '2024-06-01' },
            { id: 'task-2', title: 'Task 2', minutes: 45, due: '2024-06-02' },
            { id: 'task-3', title: 'Task 3', minutes: 60, due: '2024-06-03' },
        ];
        const rhythm = {
            focusMinutes: 25,
            shortBreak: 5,
            longBreak: 15,
            longBreakEvery: 4,
            startTime: '09:00',
        };
        const schedule = generateSchedule(task, rhythm);
        expect(schedule.length).toBeGreaterThan(0);
        expect(schedule[0].kind).toBe('focus');
    })
});