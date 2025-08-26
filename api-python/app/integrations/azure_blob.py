from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Optional

from azure.storage.blob import (
    BlobServiceClient,
    BlobClient,
    ContainerClient,
    generate_blob_sas,
    BlobSasPermissions,
)


def _require_conn_str() -> str:
    conn = os.getenv("AZURE_BLOB_CONN_STR")
    if not conn:
        raise RuntimeError("AZURE_BLOB_CONN_STR is not set")
    return conn


def get_blob_service_client() -> BlobServiceClient:
    return BlobServiceClient.from_connection_string(_require_conn_str())


def get_container_client(container: str) -> ContainerClient:
    return get_blob_service_client().get_container_client(container)


def get_blob_client(container: str, blob_name: str) -> BlobClient:
    return get_container_client(container).get_blob_client(blob_name)


def ensure_container_exists(container: str) -> None:
    cc = get_container_client(container)
    try:
        cc.create_container()
    except Exception as ex:
        # ignore "already exists"
        if "ContainerAlreadyExists" not in str(ex):
            raise


def upload_bytes(container: str, blob_name: str, data: bytes, *, overwrite: bool = True, content_type: Optional[str] = None) -> None:
    bc = get_blob_client(container, blob_name)
    if content_type:
        from azure.storage.blob import ContentSettings  # lazy import to avoid type issues
        bc.upload_blob(data, overwrite=overwrite, content_settings=ContentSettings(content_type=content_type))
    else:
        bc.upload_blob(data, overwrite=overwrite)


def upload_text(container: str, blob_name: str, text: str, *, overwrite: bool = True, content_type: str = "text/plain") -> None:
    upload_bytes(container, blob_name, text.encode("utf-8"), overwrite=overwrite, content_type=content_type)


def download_bytes(container: str, blob_name: str) -> bytes:
    bc = get_blob_client(container, blob_name)
    stream = bc.download_blob()
    return stream.readall()


def delete_blob(container: str, blob_name: str) -> None:
    bc = get_blob_client(container, blob_name)
    try:
        bc.delete_blob()
    except Exception as ex:
        # ignore not found
        if "BlobNotFound" not in str(ex):
            raise


def _parse_account_from_conn_str(conn_str: str) -> tuple[str, str]:
    """
    Extract account name and key from a classic connection string.
    """
    parts = dict(
        kv.split("=", 1) for kv in conn_str.split(";") if "=" in kv
    )
    acct = parts.get("AccountName")
    key = parts.get("AccountKey")
    if not acct or not key:
        raise RuntimeError("Could not parse AccountName/AccountKey from AZURE_BLOB_CONN_STR")
    return acct, key


def generate_blob_sas_url(container: str, blob_name: str, *, expiry_minutes: int = 60, read: bool = True, write: bool = False) -> str:
    """
    Builds a SAS URL for a specific blob using the connection string's account key.
    """
    conn = _require_conn_str()
    account_name, account_key = _parse_account_from_conn_str(conn)
    perms = BlobSasPermissions(read=read, write=write, create=write, add=write)
    sas = generate_blob_sas(
        account_name=account_name,
        container_name=container,
        blob_name=blob_name,
        account_key=account_key,
        permission=perms,
        expiry=datetime.utcnow() + timedelta(minutes=max(1, expiry_minutes)),
    )
    base_url = get_blob_client(container, blob_name).url
    return f"{base_url}?{sas}"
