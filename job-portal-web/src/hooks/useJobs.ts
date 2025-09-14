import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Job } from '../api/types/job';
import { jobsService } from '../api/services/jobs';
import { listStarred, addStar, removeStar } from '../api/python/starred';
import useAsyncState from './useAsyncState';

interface UseJobsOptions {
  page?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { page = 1, pageSize = 20, autoLoad = true } = options;
  const { data: jobs, loading, error, execute } = useAsyncState<Job[]>();
  
  const loadJobs = useCallback(async () => {
    const response = await jobsService.list({ page, pageSize });
    return response.items ?? [];
  }, [page, pageSize]);

  useEffect(() => {
    if (autoLoad) {
      execute(loadJobs);
    }
  }, [autoLoad, execute, loadJobs]);

  const refetch = useCallback(() => {
    execute(loadJobs);
  }, [execute, loadJobs]);

  return {
    jobs: jobs ?? [],
    loading,
    error,
    refetch,
  };
}

export function useStarredJobs() {
  const { isSignedIn } = useUser();
  const [starredJobIds, setStarredJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setStarredJobIds([]);
      return;
    }

    setLoading(true);
    listStarred()
      .then(setStarredJobIds)
      .catch(() => setStarredJobIds([]))
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  const toggleStar = useCallback(async (jobId: string) => {
    if (!isSignedIn) return;

    try {
      const isStarred = starredJobIds.includes(jobId);
      
      if (isStarred) {
        await removeStar(jobId);
        setStarredJobIds(prev => prev.filter(id => id !== jobId));
      } else {
        await addStar(jobId);
        setStarredJobIds(prev => [...prev, jobId]);
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
      throw error;
    }
  }, [isSignedIn, starredJobIds]);

  const isStarred = useCallback((jobId: string) => {
    return starredJobIds.includes(jobId);
  }, [starredJobIds]);

  return {
    starredJobIds,
    loading,
    toggleStar,
    isStarred,
  };
}

export default useJobs;
