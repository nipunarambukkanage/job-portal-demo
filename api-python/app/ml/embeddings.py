from __future__ import annotations

import hashlib
import math
import re
from typing import Iterable, List, Sequence


_token_re = re.compile(r"[A-Za-z0-9\+\#\.\-]+")


def _tokenize(text: str) -> list[str]:
    if not text:
        return []
    return [t.lower() for t in _token_re.findall(text)]


def _hash_idx(token: str, dims: int) -> int:
    h = hashlib.md5(token.encode("utf-8")).hexdigest()
    return int(h, 16) % dims


def embed_texts(texts: Sequence[str], dims: int = 512) -> list[list[float]]:
    """
    Very lightweight embedding via hashed bag-of-words with L2 normalization.
    Deterministic, dependency-free; good enough for heuristic ranking.
    """
    vecs: list[list[float]] = []
    for text in texts:
        v = [0.0] * dims
        toks = _tokenize(text)
        if not toks:
            vecs.append(v)
            continue
        for tok in toks:
            v[_hash_idx(tok, dims)] += 1.0
        # L2 normalize
        norm = math.sqrt(sum(x * x for x in v)) or 1.0
        vecs.append([x / norm for x in v])
    return vecs


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    s = 0.0
    for i in range(len(a)):
        s += a[i] * b[i]
    # clamp for numeric stability
    if s < 0:
        return 0.0
    if s > 1:
        return 1.0
    return float(round(s, 6))
