from __future__ import annotations

import asyncio
import os
from typing import Any, Dict, Optional

import httpx


class AzureDocIntelClient:
    """
    Thin async client for Azure Document Intelligence (Form Recognizer).
    Supports prebuilt model analysis via URL source with polling.
    """

    def __init__(
        self,
        *,
        endpoint: str,
        key: str,
        model_id: str = "prebuilt-resume",
        api_version: str = "2024-07-31",
        poll_seconds: int = 2,
        poll_attempts: int = 30,
    ) -> None:
        self.endpoint = endpoint.rstrip("/")
        self.key = key
        self.model_id = model_id
        self.api_version = api_version
        self.poll_seconds = max(1, poll_seconds)
        self.poll_attempts = max(1, poll_attempts)

    async def analyze_url(self, url_source: str) -> Dict[str, Any]:
        """
        Submit a document by URL and poll until success/failure.
        Returns final JSON result.
        """
        headers = {
            "Ocp-Apim-Subscription-Key": self.key,
            "Content-Type": "application/json",
        }
        analyze_url = (
            f"{self.endpoint}/formrecognizer/documentModels/{self.model_id}:analyze"
            f"?api-version={self.api_version}"
        )
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(analyze_url, headers=headers, json={"urlSource": url_source})
            resp.raise_for_status()
            op_loc = resp.headers.get("operation-location")
            if not op_loc:
                raise RuntimeError("Missing operation-location header from Doc Intel")

            for _ in range(self.poll_attempts):
                r = await client.get(op_loc, headers={"Ocp-Apim-Subscription-Key": self.key})
                r.raise_for_status()
                data = r.json()
                status = data.get("status")
                if status == "succeeded":
                    return data
                if status == "failed":
                    raise RuntimeError(f"Doc Intel analysis failed: {data}")
                await asyncio.sleep(self.poll_seconds)

        raise TimeoutError("Doc Intel polling timed out")


def get_docintel_client() -> AzureDocIntelClient:
    """
    Factory using environment variables:
      - AZURE_DOC_INTEL_ENDPOINT
      - AZURE_DOC_INTEL_KEY
      - DOC_INTEL_MODEL (default 'prebuilt-resume')
      - DOC_INTEL_API_VERSION (default '2024-07-31')
      - DOC_INTEL_POLL_SECONDS (default 2)
      - DOC_INTEL_POLL_ATTEMPTS (default 30)
    """
    endpoint = os.getenv("AZURE_DOC_INTEL_ENDPOINT")
    key = os.getenv("AZURE_DOC_INTEL_KEY")
    if not endpoint or not key:
        raise RuntimeError("Azure Document Intelligence env not configured (AZURE_DOC_INTEL_ENDPOINT / AZURE_DOC_INTEL_KEY)")
    model = os.getenv("DOC_INTEL_MODEL", "prebuilt-resume")
    api_version = os.getenv("DOC_INTEL_API_VERSION", "2024-07-31")
    poll_seconds = int(os.getenv("DOC_INTEL_POLL_SECONDS", "2"))
    poll_attempts = int(os.getenv("DOC_INTEL_POLL_ATTEMPTS", "30"))
    return AzureDocIntelClient(
        endpoint=endpoint,
        key=key,
        model_id=model,
        api_version=api_version,
        poll_seconds=poll_seconds,
        poll_attempts=poll_attempts,
    )
