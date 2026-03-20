from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Dict, List


ROOT = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = ROOT / "outputs"
PUBLIC_DIR = ROOT / "demo" / "public"
TARGET = PUBLIC_DIR / "sample-data.json"
TICKERS = ["aapl", "nvda", "tsla"]


def _read_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text())


def _read_csv(path: Path) -> List[Dict[str, Any]]:
    with path.open() as f:
        return list(csv.DictReader(f))


def _as_float(value: str | None) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def build() -> Dict[str, Any]:
    companies: Dict[str, Any] = {}

    for ticker in TICKERS:
        base = OUTPUTS_DIR / ticker
        snapshot = _read_json(base / "company_snapshot.json")
        reverse = _read_json(base / "reverse_analysis.json")
        annual = _read_csv(base / "forecast_annual.csv")
        monthly = _read_csv(base / "forecast_monthly.csv")
        peers = _read_csv(base / "peer_benchmark.csv")

        companies[snapshot["ticker"]] = {
            "snapshot": snapshot,
            "reverse_analysis": reverse,
            "annual_forecast": annual,
            "monthly_forecast": monthly,
            "peers": peers,
            "highlights": {
                "year1_revenue": _as_float(annual[0]["revenue"]) if annual else None,
                "year5_revenue": _as_float(annual[-1]["revenue"]) if annual else None,
                "year1_net_income": _as_float(annual[0]["net_income"]) if annual else None,
                "year5_net_income": _as_float(annual[-1]["net_income"]) if annual else None,
            },
        }

    return {
        "product_name": "Boardroom Financial Modeling Robot",
        "subtitle": "Reverse analysis, peer benchmarking, and scenario-driven forecasts",
        "companies": companies,
    }


if __name__ == "__main__":
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(build(), indent=2))
    print(f"Wrote {TARGET}")

