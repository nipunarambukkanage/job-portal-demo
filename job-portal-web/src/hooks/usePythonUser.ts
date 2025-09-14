import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUserByEmail, createUser, type CreateUserPayload } from '../api/services/python/users';

interface UserState {
  pyUserId: string | null;
  needsProfile: boolean;
  loading: boolean;
  error: string | null;
}

export function usePythonUser() {
  const { isSignedIn, user } = useUser();
  const [state, setState] = useState<UserState>({
    pyUserId: null,
    needsProfile: false,
    loading: true,
    error: null,
  });

  const checkUser = useCallback(async () => {
    if (!isSignedIn || !user) {
      setState({
        pyUserId: null,
        needsProfile: false,
        loading: false,
        error: null,
      });
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
    
    if (!email) {
      setState({
        pyUserId: null,
        needsProfile: true,
        loading: false,
        error: 'No email address found',
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const existing = await getUserByEmail(email);
      
      if (existing) {
        setState({
          pyUserId: existing.id,
          needsProfile: false,
          loading: false,
          error: null,
        });
      } else {
        setState({
          pyUserId: null,
          needsProfile: true,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        pyUserId: null,
        needsProfile: true,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check user',
      });
    }
  }, [isSignedIn, user]);

  const createPythonUser = useCallback(async (userData: Omit<CreateUserPayload, 'email'>) => {
    if (!user) throw new Error('No user signed in');
    
    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
    if (!email) throw new Error('No email address found');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const newUser = await createUser({
        ...userData,
        email,
      });

      setState({
        pyUserId: newUser.id,
        needsProfile: false,
        loading: false,
        error: null,
      });

      return newUser;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      }));
      throw error;
    }
  }, [user]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return {
    ...state,
    refetch: checkUser,
    createUser: createPythonUser,
  };
}

export default usePythonUser;
