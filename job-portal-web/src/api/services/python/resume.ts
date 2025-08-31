import { pythonClient } from '../../axios';
import { post } from '../../client';
import { py } from '../../endpoints.python';
import type { ResumeInsight } from '../../types/python/resume';

export const resumeService = {
  analyze: (form: FormData) => post<ResumeInsight[]>(pythonClient(), py.resume.analyze, form)
};
