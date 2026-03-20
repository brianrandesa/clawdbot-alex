from __future__ import annotations

from dataclasses import asdict
from datetime import datetime
from typing import Dict, Tuple

import numpy as np
import pandas as pd

from .types import Assumptions, CompanySnapshot, ReverseAnalysis


def _default_growth_path(base_growth: float | None, horizon_years: int) -> Dict[str, float]:
    base = base_growth if base_growth is not None else 0.06
    decay = 0.015
    out: Dict[str, float] = {}
    for i in range(1, horizon_years + 1):
        out[f"year{i}"] = max(base - decay * (i - 1), 0.02)
    return out


def _scenario_growth(growth: float, scenario: str) -> float:
    if scenario == "bear":
        return max(growth - 0.04, -0.02)
    if scenario == "bull":
        return growth + 0.04
    return growth


def _blend_weights(weights: Dict[str, float]) -> Dict[str, float]:
    total = sum(max(v, 0) for v in weights.values())
    if total <= 0:
        return {"bear": 0.2, "base": 0.6, "bull": 0.2}
    return {k: max(v, 0) / total for k, v in weights.items()}


def build_financial_model(
    snapshot: CompanySnapshot,
    reverse_analysis: ReverseAnalysis,
    assumptions: Assumptions,
    horizon_years: int,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    if horizon_years < 1 or horizon_years > 5:
        raise ValueError("horizon_years must be between 1 and 5.")

    latest_revenue = snapshot.revenue_ttm or 1.0
    latest_net_margin = snapshot.net_margin if snapshot.net_margin is not None else 0.12
    latest_gross_margin = snapshot.gross_margin if snapshot.gross_margin is not None else 0.45
    latest_op_margin = snapshot.operating_margin if snapshot.operating_margin is not None else 0.18

    growth_curve = _default_growth_path(reverse_analysis.revenue_cagr_3y, horizon_years)
    growth_curve.update(assumptions.revenue_growth_overrides)
    weights = _blend_weights(assumptions.scenario_weights)

    gross_margin = assumptions.margin_overrides.get("gross_margin", latest_gross_margin)
    operating_margin = assumptions.margin_overrides.get("operating_margin", latest_op_margin)
    net_margin = assumptions.margin_overrides.get("net_margin", latest_net_margin)

    annual_rows = []
    revenue = latest_revenue
    start_year = datetime.utcnow().year

    for i in range(1, horizon_years + 1):
        base_growth = growth_curve.get(f"year{i}", 0.05)
        bear = _scenario_growth(base_growth, "bear")
        base = _scenario_growth(base_growth, "base")
        bull = _scenario_growth(base_growth, "bull")
        blended_growth = (
            weights.get("bear", 0.2) * bear
            + weights.get("base", 0.6) * base
            + weights.get("bull", 0.2) * bull
        )

        revenue = revenue * (1 + blended_growth)
        gross_profit = revenue * gross_margin
        operating_income = revenue * operating_margin
        net_income = revenue * net_margin
        implied_eps_growth = blended_growth * (1.10 if reverse_analysis.operating_leverage_score and reverse_analysis.operating_leverage_score > 1 else 0.95)

        annual_rows.append(
            {
                "year": start_year + i,
                "revenue": revenue,
                "growth_rate": blended_growth,
                "gross_profit": gross_profit,
                "operating_income": operating_income,
                "net_income": net_income,
                "gross_margin": gross_margin,
                "operating_margin": operating_margin,
                "net_margin": net_margin,
                "implied_eps_growth": implied_eps_growth,
                "scenario_growth_bear": bear,
                "scenario_growth_base": base,
                "scenario_growth_bull": bull,
            }
        )

    annual_df = pd.DataFrame(annual_rows)

    monthly_rows = []
    y1 = annual_df.iloc[0]
    monthly_growth = (1 + y1["growth_rate"]) ** (1 / 12) - 1
    monthly_revenue = latest_revenue / 12
    for month in range(1, 13):
        monthly_revenue *= 1 + monthly_growth
        monthly_rows.append(
            {
                "month_index": month,
                "revenue": monthly_revenue,
                "gross_profit": monthly_revenue * gross_margin,
                "operating_income": monthly_revenue * operating_margin,
                "net_income": monthly_revenue * net_margin,
                "monthly_growth": monthly_growth,
            }
        )
    monthly_df = pd.DataFrame(monthly_rows)

    return monthly_df, annual_df

