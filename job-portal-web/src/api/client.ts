import type { AxiosInstance } from 'axios';

export async function get<T>(c: AxiosInstance, url: string, params?: unknown) {
  const r = await c.get<T>(url, { params }); return r.data;
}
export async function post<T>(c: AxiosInstance, url: string, body?: unknown) {
  const r = await c.post<T>(url, body); return r.data;
}
export async function put<T>(c: AxiosInstance, url: string, body?: unknown) {
  const r = await c.put<T>(url, body); return r.data;
}
export async function del<T>(c: AxiosInstance, url: string) {
  const r = await c.delete<T>(url); return r.data;
}
