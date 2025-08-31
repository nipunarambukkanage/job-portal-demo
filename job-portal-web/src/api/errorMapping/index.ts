import { mapDotNetError } from './dotnet';
import { mapPythonError } from './python';
import { ApiError } from '../types/common';

export const errorMapper = (e: any): ApiError => {
  const url: string = e?.config?.baseURL || '';
  if (url.includes('://') && (url.includes('localhost:5000') || url.includes('/api'))) return mapDotNetError(e);
  return mapPythonError(e);
};
