from __future__ import annotations

from .embeddings import embed_texts, cosine_similarity
from .recommend import (
    recommend_jobs_for_resume,
    recommend_resumes_for_job,
)

__all__ = [
    "embed_texts",
    "cosine_similarity",
    "recommend_jobs_for_resume",
    "recommend_resumes_for_job",
]
