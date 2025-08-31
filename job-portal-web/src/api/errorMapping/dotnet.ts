import { ApiError } from '../types/common';
export const mapDotNetError = (e: any): ApiError => {
  const status = e?.response?.status ?? 500;
  const code = e?.response?.data?.error?.code ?? e?.response?.data?.code;
  const message = e?.response?.data?.error?.message ?? e?.response?.data?.message ?? 'Server error';
  return { status, code, message, details: e?.response?.data };
};
