export type Id = string | number;
export interface ApiError { status: number; code?: string; message: string; details?: unknown; }
export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number; }
