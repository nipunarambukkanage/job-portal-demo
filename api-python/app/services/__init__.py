from __future__ import annotations

from .parsing import parse_resume_via_docintel
from .normalize import normalize_docintel_resume
from .matching import (
    score_skills_overlap,
    match_jobs_for_candidate,
    match_candidates_for_job,
)
from .storage import (
    ensure_blob_url,
    download_blob_to_bytes,
    upload_text_blob,
    delete_blob,
)
from .analytics import (
    employer_applications_summary,
    candidate_funnel_summary,
)

__all__ = [
    # parsing / normalization
    "parse_resume_via_docintel",
    "normalize_docintel_resume",
    # matching
    "score_skills_overlap",
    "match_jobs_for_candidate",
    "match_candidates_for_job",
    # storage
    "ensure_blob_url",
    "download_blob_to_bytes",
    "upload_text_blob",
    "delete_blob",
    # analytics
    "employer_applications_summary",
    "candidate_funnel_summary",
]
