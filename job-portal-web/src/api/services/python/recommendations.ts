import { pythonClient } from '../../axios';
import { get } from '../../client';
import { py } from '../../endpoints.python';
import type { Recommendation } from '../../types/python/recommendations';

export const recommendationsService = {
  list: () => get<Recommendation[]>(pythonClient(), py.recs.list)
};
