import { describe, it, expect } from 'vitest';
import { Rhythm, BlockKind, Block, PlannerData, SavedSession, ActiveSession, Task, SoundId } from '../../src/planner/types';

describe('Task type', () => {
  it('should have the correct properties', () => {
    const task: Task = {
      id: '1',
      title: 'Test Task',
      minutes: 30,
      due: '2024-06-01',
    };
    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('title');
    expect(task).toHaveProperty('minutes');
    expect(task).toHaveProperty('due');
  });
});

describe('SoundId type', () => {
    it('should allow only specific string values', () => {
        const sound: SoundId = 'chime';
        expect(sound).toBe('chime');
    });
});

describe('Rhythm type', () => {
  it('should have the correct properties', () => {
    const rhythm: Rhythm = {
      focusMinutes: 25,
      shortBreak: 5,
      longBreak: 15,
      longBreakEvery: 4,
      startTime: '09:00',
    };
    expect(rhythm).toHaveProperty('focusMinutes');
    expect(rhythm).toHaveProperty('shortBreak');
    expect(rhythm).toHaveProperty('longBreak');
    expect(rhythm).toHaveProperty('longBreakEvery');
    expect(rhythm).toHaveProperty('startTime');
  });
});

describe('BlockKind type', () => {
  it('should allow only specific string values', () => {
    const kind: BlockKind = 'focus';
    expect(kind).toBe('focus');
  });
});

describe('Block type', () => {
  it('should have the correct properties', () => {
    const block: Block = {
      id: '1',
      kind: 'focus',
      label: 'Focus Block',
      start: new Date(),
      end: new Date(),
      minutes: 25,
    };
    expect(block).toHaveProperty('id');
    expect(block).toHaveProperty('kind');
    expect(block).toHaveProperty('label');
    expect(block).toHaveProperty('start');
    expect(block).toHaveProperty('end');
    expect(block).toHaveProperty('minutes');
  });
});

describe('PlannerData type', () => {
  it('should have the correct properties', () => {
    const plannerData: PlannerData = {
      tasks: [],
      sound: 'chime',
      playlistUrl: '',
      rhythm: {
        focusMinutes: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakEvery: 4,
        startTime: '09:00',
      },
    };
    expect(plannerData).toHaveProperty('tasks');
    expect(plannerData).toHaveProperty('sound');
    expect(plannerData).toHaveProperty('playlistUrl');
    expect(plannerData).toHaveProperty('rhythm');
  });
});

describe('SavedSession type', () => {
  it('should have the correct properties', () => {
    const savedSession: SavedSession = {
      id: '1',
      name: 'Test Session',
      createdAt: '2024-06-01',
      updatedAt: '2024-06-01',
      data: {
        tasks: [],
        sound: 'chime',
        playlistUrl: '',
        rhythm: {
          focusMinutes: 25,
          shortBreak: 5,
          longBreak: 15,
          longBreakEvery: 4,
          startTime: '09:00',
        },
      },
    };
    expect(savedSession).toHaveProperty('id');
    expect(savedSession).toHaveProperty('name');
    expect(savedSession).toHaveProperty('createdAt');
    expect(savedSession).toHaveProperty('updatedAt');
    expect(savedSession).toHaveProperty('data');
  });
});

describe('ActiveSession type', () => {
  it('should have the correct properties', () => {
    const activeSession: ActiveSession = {
      id: '1',
      name: 'Active Session',
    };
    expect(activeSession).toHaveProperty('id');
    expect(activeSession).toHaveProperty('name');
  });
});