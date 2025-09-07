export const py = {
  recs: { list: '/recommendations' },
  resume: {
    analyze: '/resume/analyze',
    ingest: '/v1/resumes/ingest',
  },
  analytics: { insights: '/analytics/insights' },
} as const;
