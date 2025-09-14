import type { Job } from '../api/types/job';

// Stable seeded random number generator
const seeded = (key: string): number => {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h = (h ^ key.charCodeAt(i)) * 16777619;
  }
  // Return 0..1
  return ((h >>> 0) % 1000) / 1000;
};

export const calculatePopularityScore = (job: Job): number => {
  // Stable 45..97% based on id + salary
  const base = seeded(job.id) * 0.5 + 0.45;
  const salaryBoost = (job.salaryMax ?? 0) > 0 
    ? Math.min((job.salaryMax as number) / 200000, 0.3) 
    : 0;
  return Math.min(0.97, base + salaryBoost) * 100;
};

export const isNewJob = (job: Job): boolean => {
  const created = job.createdAt ? new Date(job.createdAt) : null;
  if (!created) return false;
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

export const isHotJob = (job: Job): boolean => {
  return calculatePopularityScore(job) >= 80;
};

export const isRecommendedJob = (job: Job): boolean => {
  return calculatePopularityScore(job) >= 75 || (job.salaryMax ?? 0) >= 150000;
};

export const isRemoteJob = (job: Job): boolean => {
  return (job.location || '').toLowerCase().includes('remote');
};

export const formatSalary = (min?: number | null, max?: number | null): string => {
  if (min && max) return `${min} - ${max}`;
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return '—';
};

export const getJobTags = (job: Job) => {
  const tags = [];
  
  if (isRecommendedJob(job)) {
    tags.push({ key: 'recommended', label: 'Recommended', color: 'success' as const });
  }
  
  if (isHotJob(job)) {
    tags.push({ key: 'hot', label: 'Hot', color: 'error' as const });
  }
  
  if (isNewJob(job)) {
    tags.push({ key: 'new', label: 'New', color: 'primary' as const });
  }
  
  if (isRemoteJob(job)) {
    tags.push({ key: 'remote', label: 'Remote', color: 'default' as const, variant: 'outlined' as const });
  }
  
  return tags;
};

export const isGuid = (s: string | undefined | null): s is string =>
  !!s &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s);

export default {
  calculatePopularityScore,
  isNewJob,
  isHotJob,
  isRecommendedJob,
  isRemoteJob,
  formatSalary,
  getJobTags,
  isGuid,
};
