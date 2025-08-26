from __future__ import annotations

import os
import smtplib
import ssl
from email.message import EmailMessage
from typing import Iterable, Optional


class EmailSendError(RuntimeError):
    pass


def _smtp_conf() -> dict:
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USERNAME")
    pwd = os.getenv("SMTP_PASSWORD")
    use_tls = os.getenv("SMTP_TLS", "true").lower() in ("1", "true", "yes", "on")
    from_addr = os.getenv("SMTP_FROM")
    if not host or not from_addr:
        raise EmailSendError("SMTP_HOST and SMTP_FROM must be set")
    return {
        "host": host,
        "port": port,
        "user": user,
        "pwd": pwd,
        "use_tls": use_tls,
        "from_addr": from_addr,
    }


def send_email(
    *,
    to: Iterable[str],
    subject: str,
    text_body: str,
    html_body: Optional[str] = None,
    cc: Optional[Iterable[str]] = None,
    bcc: Optional[Iterable[str]] = None,
    attachments: Optional[list[tuple[str, bytes, str]]] = None,  # (filename, bytes, mime)
) -> None:
    """
    Sends an email using SMTP. Supports TLS and simple attachments.
    """
    cfg = _smtp_conf()

    msg = EmailMessage()
    msg["From"] = cfg["from_addr"]
    msg["To"] = ", ".join(to)
    if cc:
        msg["Cc"] = ", ".join(cc)
    if bcc:
        # BCC not set in headers for privacy; include in rcpt list
        pass
    msg["Subject"] = subject
    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    for att in attachments or []:
        name, data, mime = att
        maintype, _, subtype = mime.partition("/")
        msg.add_attachment(data, maintype=maintype or "application", subtype=subtype or "octet-stream", filename=name)

    recipients = list(to) + list(cc or []) + list(bcc or [])
    try:
        if cfg["use_tls"]:
            context = ssl.create_default_context()
            with smtplib.SMTP(cfg["host"], cfg["port"]) as s:
                s.ehlo()
                s.starttls(context=context)
                s.ehlo()
                if cfg["user"] and cfg["pwd"]:
                    s.login(cfg["user"], cfg["pwd"])
                s.send_message(msg, from_addr=cfg["from_addr"], to_addrs=recipients)
        else:
            with smtplib.SMTP(cfg["host"], cfg["port"]) as s:
                if cfg["user"] and cfg["pwd"]:
                    s.login(cfg["user"], cfg["pwd"])
                s.send_message(msg, from_addr=cfg["from_addr"], to_addrs=recipients)
    except Exception as ex:
        raise EmailSendError(f"Failed to send email: {ex}") from ex
