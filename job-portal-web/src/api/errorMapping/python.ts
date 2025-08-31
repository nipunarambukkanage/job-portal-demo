import { ApiError } from '../types/common';
export const mapPythonError = (e: any): ApiError => {
  const status = e?.response?.status ?? 500;
  const code = e?.response?.data?.detail?.code ?? e?.response?.data?.code;
  const message = e?.response?.data?.detail?.message ?? e?.response?.data?.detail ?? e?.message ?? 'Server error';
  return { status, code, message, details: e?.response?.data };
};
