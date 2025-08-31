import { pythonClient } from '../../axios';
import { get } from '../../client';
import { py } from '../../endpoints.python';
import type { InsightPoint } from '../../types/python/analytics';

export const analyticsService = {
  insights: () => get<InsightPoint[]>(pythonClient(), py.analytics.insights)
};
