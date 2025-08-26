from __future__ import annotations

from typing import Generic, Iterable, List, Sequence, Tuple, TypeVar

from app.schemas.common import Page

T = TypeVar("T")


def clamp_page_size(page: int, size: int, *, min_size: int = 1, max_size: int = 200) -> tuple[int, int]:
    """
    Ensures page and size are in sane bounds.
    """
    page = 1 if page < 1 else page
    if size < min_size:
        size = min_size
    if size > max_size:
        size = max_size
    return page, size


def to_page(items: Sequence[T], total: int, *, page: int, size: int) -> Page[T]:
    """
    Builds a Page[T] response from a slice and total count.
    """
    return Page[T](items=list(items), page=page, size=size, total=total)
