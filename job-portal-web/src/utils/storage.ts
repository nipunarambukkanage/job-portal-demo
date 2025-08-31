export const storage = {
  set<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); },
  get<T>(k: string): T | null { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : null; },
  del(k: string) { localStorage.removeItem(k); }
};
