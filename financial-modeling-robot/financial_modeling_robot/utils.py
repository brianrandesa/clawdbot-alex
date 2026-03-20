from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import numpy as np


def to_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        if np.isnan(value):
            return None
    except TypeError:
        pass
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def cagr(start_value: float | None, end_value: float | None, periods: int) -> float | None:
    if not start_value or not end_value or periods <= 0:
        return None
    if start_value <= 0 or end_value <= 0:
        return None
    return (end_value / start_value) ** (1 / periods) - 1


def safe_divide(a: float | None, b: float | None) -> float | None:
    if a is None or b in (None, 0):
        return None
    return a / b


def load_json(path: str | None) -> Dict[str, Any]:
    if not path:
        return {}
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Assumptions file not found: {path}")
    return json.loads(p.read_text())

