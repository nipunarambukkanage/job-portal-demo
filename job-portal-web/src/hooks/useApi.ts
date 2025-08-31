import { useAuth } from '@clerk/clerk-react';
import { setAuthTokenGetter } from '../api/axios';
import { useEffect } from 'react';

export const useApiBridge = () => {
  const { getToken } = useAuth();
  useEffect(() => { setAuthTokenGetter(() => getToken({ template: 'default' })); }, [getToken]);
};
