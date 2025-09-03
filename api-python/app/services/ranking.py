from __future__ import annotations
from collections import Counter
from typing import Iterable

def jaccard(a: Iterable[str], b: Iterable[str]) -> float:
    sa, sb = set(x.lower() for x in a), set(x.lower() for x in b)
    if not sa or not sb: return 0.0
    return len(sa & sb) / float(len(sa | sb))
