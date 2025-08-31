import type { RootState } from './rootReducer';
export const selectAuth = (s: RootState) => s.auth;
export const selectJobs = (s: RootState) => s.jobs;
export const selectUI = (s: RootState) => s.ui;
export const selectErrors = (s: RootState) => s.errors;
export const selectNotifications = (s: RootState) => s.notifications;
