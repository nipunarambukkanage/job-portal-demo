from __future__ import annotations

from app.services.normalize import normalize_docintel_resume


def test_normalize_resume_fields_basic():
    raw = {
        "status": "succeeded",
        "documents": [
            {
                "fields": {
                    "contactInfo": {
                        "name": "Jane Doe",
                        "emails": ["jane@example.com"],
                        "phones": ["+1 555 1234"],
                        "location": "Colombo, LK",
                    },
                    "skills": ["Python", "FastAPI", "Postgres"],
                    "languages": ["English", "Sinhala"],
                    "workExperience": [
                        {
                            "jobTitle": "Backend Engineer",
                            "organization": "Acme",
                            "startDate": "2020-01-01",
                            "endDate": "2022-01-01",
                            "description": "Built APIs",
                            "location": "Remote",
                        }
                    ],
                    "education": [
                        {
                            "school": "UoM",
                            "degree": "BSc",
                            "fieldOfStudy": "CS",
                            "startDate": "2015-01-01",
                            "endDate": "2019-01-01",
                        }
                    ],
                    "certifications": [
                        {
                            "name": "AWS Certified",
                            "issuer": "Amazon",
                            "issuedDate": "2021-01-01",
                            "expiresDate": "2024-01-01",
                        }
                    ],
                    "summary": "Backend dev with ML interest",
                }
            }
        ],
    }

    out = normalize_docintel_resume(raw)
    assert out["full_name"] == "Jane Doe"
    assert out["email"] == "jane@example.com"
    assert "python" in [s.lower() for s in out["skills"]]
    assert out["education"]["items"][0]["degree"] == "BSc"
    assert out["experience"]["items"][0]["company"] == "Acme"
    assert out["certifications"]["items"][0]["issuer"] == "Amazon"
    assert out["total_experience_months"] is not None
