import pythonClient from "../../clients/python";

export type RecommendationQuery = {
  userId?: string;
  jobId?: string;
  limit?: number;
};

export type RecommendationItem = {
  id: string | number;
  score?: number;
  [key: string]: unknown;
};

/** GET /ai/recommendations (Python API) */
export async function getRecommendations(
  params: RecommendationQuery = {}
): Promise<RecommendationItem[]> {
  const { data } = await pythonClient.get("/ai/recommendations", { params });
  return data as RecommendationItem[];
}

/** POST /ai/recommendations/feedback (Python API) */
export async function sendRecommendationFeedback(payload: {
  recommendationId: string | number;
  action: "like" | "dislike" | "dismiss";
}) {
  await pythonClient.post("/ai/recommendations/feedback", payload);
}
