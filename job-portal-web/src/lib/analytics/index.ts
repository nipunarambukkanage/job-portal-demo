import { AnalyticsEvents } from './events';
export const track = (name: keyof typeof AnalyticsEvents | string, payload?: Record<string,unknown>) => {
  // hook to any analytics destination
  // eslint-disable-next-line no-console
  console.log('[analytics]', name, payload || {});
};
