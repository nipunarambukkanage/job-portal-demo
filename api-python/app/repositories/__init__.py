from __future__ import annotations

from .resume_repo import (
    create_resume,
    get_resume,
    list_user_resumes,
    set_resume_parse_status,
    save_resume_raw_docintel,
    delete_resume,
)
from .resume_features_repo import (
    get_resume_features,
    upsert_resume_features,
)
from .job_repo import (
    create_job,
    get_job,
    list_jobs,
    update_job,
    deactivate_job,
)
from .application_repo import (
    create_application,
    get_application,
    list_applications_by_job,
    list_applications_by_candidate,
    update_application_status,
    get_application_by_job_and_candidate,
)
from .user_repo import (
    create_user,
    get_user,
    get_user_by_email,
    get_user_by_external_id,
    list_users,
    list_users_by_org,
    update_user,
    deactivate_user,
    delete_user,
)

__all__ = [
    # resumes
    "create_resume",
    "get_resume",
    "list_user_resumes",
    "set_resume_parse_status",
    "save_resume_raw_docintel",
    "delete_resume",
    # resume features
    "get_resume_features",
    "upsert_resume_features",
    # jobs
    "create_job",
    "get_job",
    "list_jobs",
    "update_job",
    "deactivate_job",
    # applications
    "create_application",
    "get_application",
    "get_application_by_job_and_candidate",
    "list_applications_by_job",
    "list_applications_by_candidate",
    "update_application_status",
    # users
    "create_user",
    "get_user",
    "get_user_by_email",
    "get_user_by_external_id",
    "list_users",
    "list_users_by_org",
    "update_user",
    "deactivate_user",
    "delete_user",
]
