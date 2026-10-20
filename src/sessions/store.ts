import { supabase } from '../lib/supabase';
import type { PlannerData, SavedSession } from '../planner/types';

const LOCAL_KEY = 'laika:sessions';
const COLUMNS = 'id, name, data, created_at, updated_at';

type Row = { id: string; name: string; data: PlannerData; created_at: string; updated_at: string };

const fromRow = (r: Row): SavedSession => ({
  id: r.id,
  name: r.name,
  data: r.data,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

function readLocal(): SavedSession[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as SavedSession[];
  } catch {
    return [];
  }
}

function writeLocal(list: SavedSession[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

export async function listSessions(userId: string | null): Promise<SavedSession[]> {
  if (!userId) {
    return readLocal().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const { data, error } = await supabase
    .from('study_sessions')
    .select(COLUMNS)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(fromRow);
}

export async function createSession(
  userId: string | null,
  name: string,
  data: PlannerData
): Promise<SavedSession> {
  if (!userId) {
    const now = new Date().toISOString();
    const session: SavedSession = { id: crypto.randomUUID(), name, data, createdAt: now, updatedAt: now };
    writeLocal([...readLocal(), session]);
    return session;
  }
  const { data: row, error } = await supabase
    .from('study_sessions')
    .insert({ name, data })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return fromRow(row as Row);
}

export async function updateSession(
  userId: string | null,
  id: string,
  patch: { name?: string; data?: PlannerData }
): Promise<void> {
  const updatedAt = new Date().toISOString();
  if (!userId) {
    writeLocal(readLocal().map((s) => (s.id === id ? { ...s, ...patch, updatedAt } : s)));
    return;
  }
  const { error } = await supabase
    .from('study_sessions')
    .update({ ...patch, updated_at: updatedAt })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteSession(userId: string | null, id: string): Promise<void> {
  if (!userId) {
    writeLocal(readLocal().filter((s) => s.id !== id));
    return;
  }
  const { error } = await supabase.from('study_sessions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}