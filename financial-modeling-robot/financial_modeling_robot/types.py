from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class Assumptions:
    scenario_weights: Dict[str, float] = field(
        default_factory=lambda: {"bear": 0.2, "base": 0.6, "bull": 0.2}
    )
    revenue_growth_overrides: Dict[str, float] = field(default_factory=dict)
    margin_overrides: Dict[str, float] = field(default_factory=dict)


@dataclass
class CompanySnapshot:
    ticker: str
    long_name: str
    sector: str
    industry: str
    market_cap: Optional[float]
    enterprise_value: Optional[float]
    trailing_pe: Optional[float]
    forward_pe: Optional[float]
    price_to_sales: Optional[float]
    ebitda_margin: Optional[float]
    gross_margin: Optional[float]
    operating_margin: Optional[float]
    net_margin: Optional[float]
    revenue_ttm: Optional[float]
    eps_ttm: Optional[float]


@dataclass
class ReverseAnalysis:
    revenue_cagr_3y: Optional[float]
    eps_cagr_3y: Optional[float]
    gross_margin_trend_bps: Optional[float]
    operating_margin_trend_bps: Optional[float]
    net_margin_trend_bps: Optional[float]
    operating_leverage_score: Optional[float]
    capital_intensity_ratio: Optional[float]
    working_capital_efficiency: Optional[float]
    key_drivers: List[str]
    key_risks: List[str]

