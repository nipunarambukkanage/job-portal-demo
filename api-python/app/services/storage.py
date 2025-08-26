from __future__ import annotations

import io
import os
from typing import Optional
import logging

log = logging.getLogger(__name__)

# We keep imports inside functions so the app can run without the package installed
# until a storage operation is actually used.


def ensure_blob_url(url: str) -> str:
    """
    Minimal guard to ensure a blob URL (or SAS URL) looks sane.
    """
    if not url or "http" not in url or "core.windows.net" not in url:
        raise ValueError("Invalid Azure Blob URL")
    return url


def _get_blob_client(container: str, blob_name: str):
    try:
        from azure.storage.blob import BlobServiceClient
    except Exception as ex:
        raise RuntimeError("azure-storage-blob is required for blob operations") from ex

    conn = os.getenv("AZURE_BLOB_CONN_STR")
    if not conn:
        raise RuntimeError("AZURE_BLOB_CONN_STR is not set")
    svc = BlobServiceClient.from_connection_string(conn)
    return svc.get_container_client(container).get_blob_client(blob_name)


def download_blob_to_bytes(container: str, blob_name: str) -> bytes:
    """
    Downloads a blob into memory (bytes). Keep an eye on object sizes; for large files use streaming.
    """
    bc = _get_blob_client(container, blob_name)
    stream = bc.download_blob()
    return stream.readall()


def upload_text_blob(container: str, blob_name: str, text: str, *, overwrite: bool = True, content_type: str = "text/plain") -> None:
    bc = _get_blob_client(container, blob_name)
    bc.upload_blob(text.encode("utf-8"), overwrite=overwrite, content_settings={"content_type": content_type})


def delete_blob(container: str, blob_name: str) -> None:
    bc = _get_blob_client(container, blob_name)
    try:
        bc.delete_blob()
    except Exception as ex:
        # Ignore not-found; rethrow others
        msg = str(ex).lower()
        if "not found" in msg or "404" in msg:
            return
        raise
