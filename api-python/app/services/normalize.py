from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any, Dict, List, Optional

def _first(val: Any) -> Optional[str]:
    if isinstance(val, list) and val:
        return str(val[0])
    if isinstance(val, str):
        return val
    return None

def _to_months(start: Optional[date], end: Optional[date]) -> int:
    if not start or not end:
        return 0
    return max(0, (end.year - start.year) * 12 + (end.month - start.month))

def _parse_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    try:
        return date.fromisoformat(s[:10])
    except Exception:
        # crude fallback for formats like "Jan 2020"
        m = re.match(r"([A-Za-z]{3,9})\s+(\d{4})", s)
        if m:
            try:
                return date.fromisoformat(f"{m.group(2)}-01-01")
            except Exception:
                return None
        return None

def _extract_contact(fields: Dict[str, Any]) -> Dict[str, Any]:
    # Doc Intel prebuilt-resume commonly uses "contactInfo" or "ContactInfo"
    ci = fields.get("contactInfo") or fields.get("ContactInfo") or {}
    # Sometimes emails/phones are direct lists, sometimes nested fields
    emails = ci.get("emails") or ci.get("Emails") or ci.get("email") or ci.get("Email")
    phones = ci.get("phones") or ci.get("Phones") or ci.get("phone") or ci.get("Phone")
    websites = ci.get("websites") or ci.get("Websites")
    name = ci.get("name") or ci.get("Name") or fields.get("name") or fields.get("Name")
    location = ci.get("location") or ci.get("Location")

    def as_list(x):
        if x is None:
            return None
        if isinstance(x, list):
            return [str(i) for i in x]
        return [str(x)]

    return {
        "full_name": _first(name) or None,
        "emails": as_list(emails),
        "phones": as_list(phones),
        "websites": as_list(websites),
        "location": _first(location),
    }

def _extract_experience(fields: Dict[str, Any]) -> List[Dict[str, Any]]:
    exp = fields.get("workExperience") or fields.get("WorkExperience") or fields.get("Experience") or []
    out: List[Dict[str, Any]] = []
    if isinstance(exp, dict):
        exp = exp.get("items") or exp.get("jobs") or []
    if not isinstance(exp, list):
        return out

    for it in exp:
        title = it.get("jobTitle") or it.get("title") or it.get("JobTitle")
        company = it.get("organization") or it.get("company") or it.get("Company")
        start = _parse_date(_first(it.get("startDate") or it.get("StartDate")))
        end_raw = _first(it.get("endDate") or it.get("EndDate"))
        end = _parse_date(end_raw)
        is_current = False
        if end_raw:
            is_current = str(end_raw).strip().lower() in {"present", "current"}
        desc = it.get("description") or it.get("Description")
        loc = it.get("location") or it.get("Location")
        out.append({
            "title": _first(title),
            "company": _first(company),
            "start_date": start,
            "end_date": None if is_current else end,
            "is_current": is_current or (end is None),
            "description": _first(desc),
            "location": _first(loc),
        })
    return out

def _extract_education(fields: Dict[str, Any]) -> List[Dict[str, Any]]:
    edu = fields.get("education") or fields.get("Education") or []
    out: List[Dict[str, Any]] = []
    if isinstance(edu, dict):
        edu = edu.get("items") or edu.get("schools") or []
    if not isinstance(edu, list):
        return out

    for it in edu:
        institution = it.get("school") or it.get("institution") or it.get("School")
        degree = it.get("degree") or it.get("Degree")
        field = it.get("fieldOfStudy") or it.get("FieldOfStudy")
        start = _parse_date(_first(it.get("startDate") or it.get("StartDate")))
        end = _parse_date(_first(it.get("endDate") or it.get("EndDate")))
        out.append({
            "institution": _first(institution),
            "degree": _first(degree),
            "field_of_study": _first(field),
            "start_date": start,
            "end_date": end,
        })
    return out

def _extract_certs(fields: Dict[str, Any]) -> List[Dict[str, Any]]:
    certs = fields.get("certifications") or fields.get("Certifications") or []
    out: List[Dict[str, Any]] = []
    if isinstance(certs, dict):
        certs = certs.get("items") or []
    if not isinstance(certs, list):
        return out

    for it in certs:
        name = it.get("name") or it.get("Name")
        issuer = it.get("issuer") or it.get("Issuer")
        issued = _parse_date(_first(it.get("issuedDate") or it.get("IssuedDate")))
        expires = _parse_date(_first(it.get("expiresDate") or it.get("ExpiresDate")))
        out.append({
            "name": _first(name),
            "issuer": _first(issuer),
            "issued_date": issued,
            "expires_date": expires,
        })
    return out

def _extract_list(fields: Dict[str, Any], *keys: str) -> List[str] | None:
    for k in keys:
        v = fields.get(k)
        if v:
            if isinstance(v, list):
                return [str(x) for x in v]
            return [str(v)]
    return None

def normalize_docintel_resume(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Accepts a *trimmed* Doc Intel response and returns a dict compatible with ResumeFeatures upsert.
    """
    documents = raw.get("documents") or []
    fields: Dict[str, Any] = {}
    if documents and isinstance(documents, list):
        # v3 style: each document has "fields" (map)
        fields = documents[0].get("fields") or {}

    contact = _extract_contact(fields)
    experience = _extract_experience(fields)
    education = _extract_education(fields)
    certifications = _extract_certs(fields)

    # total experience months (approx)
    months = 0
    for item in experience:
        start = item.get("start_date")
        end = item.get("end_date") or date.today()
        months += _to_months(start, end)

    return {
        "full_name": contact.get("full_name"),
        "email": (contact.get("emails") or [None])[0],
        "phone": (contact.get("phones") or [None])[0],
        "summary": fields.get("professionalSummary") or fields.get("summary") or None,
        "skills": _extract_list(fields, "skills", "Skills"),
        "languages": _extract_list(fields, "languages", "Languages"),
        "education": {"items": education} if education else None,
        "experience": {"items": experience} if experience else None,
        "certifications": {"items": certifications} if certifications else None,
        "total_experience_months": months or None,
    }
