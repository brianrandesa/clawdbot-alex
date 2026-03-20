from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Dict

import pandas as pd

from .types import CompanySnapshot, ReverseAnalysis


def write_outputs(
    output_dir: str,
    snapshot: CompanySnapshot,
    reverse_analysis: ReverseAnalysis,
    peers_df: pd.DataFrame,
    monthly_df: pd.DataFrame,
    annual_df: pd.DataFrame,
) -> Dict[str, str]:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    snapshot_path = out / "company_snapshot.json"
    reverse_path = out / "reverse_analysis.json"
    peers_path = out / "peer_benchmark.csv"
    monthly_path = out / "forecast_monthly.csv"
    annual_path = out / "forecast_annual.csv"
    brief_path = out / "executive_brief.md"

    snapshot_path.write_text(json.dumps(asdict(snapshot), indent=2))
    reverse_path.write_text(json.dumps(asdict(reverse_analysis), indent=2))
    peers_df.to_csv(peers_path, index=False)
    monthly_df.to_csv(monthly_path, index=False)
    annual_df.to_csv(annual_path, index=False)
    brief_path.write_text(_build_executive_brief(snapshot, reverse_analysis, annual_df, peers_df))

    return {
        "company_snapshot": str(snapshot_path),
        "reverse_analysis": str(reverse_path),
        "peer_benchmark": str(peers_path),
        "forecast_monthly": str(monthly_path),
        "forecast_annual": str(annual_path),
        "executive_brief": str(brief_path),
    }


def _build_executive_brief(
    snapshot: CompanySnapshot,
    reverse_analysis: ReverseAnalysis,
    annual_df: pd.DataFrame,
    peers_df: pd.DataFrame,
) -> str:
    y1 = annual_df.iloc[0].to_dict()
    y_last = annual_df.iloc[-1].to_dict()

    peer_subset = peers_df[["ticker", "market_cap", "forward_pe", "price_to_sales", "operating_margin"]].copy()
    peer_subset = peer_subset.sort_values(by="market_cap", ascending=False)
    peer_preview = peer_subset.head(8).to_markdown(index=False)

    drivers = "\n".join([f"- {d}" for d in reverse_analysis.key_drivers])
    risks = "\n".join([f"- {r}" for r in reverse_analysis.key_risks])

    return f"""# Executive Financial Model Brief: {snapshot.long_name} ({snapshot.ticker})

## Company Baseline
- Sector: {snapshot.sector}
- Industry: {snapshot.industry}
- Revenue TTM: {snapshot.revenue_ttm}
- Net Margin: {snapshot.net_margin}
- Forward P/E: {snapshot.forward_pe}
- Price/Sales: {snapshot.price_to_sales}

## Reverse Analysis Diagnostics
- Revenue CAGR (3Y): {reverse_analysis.revenue_cagr_3y}
- Earnings CAGR Proxy (3Y): {reverse_analysis.eps_cagr_3y}
- Gross Margin Trend (bps): {reverse_analysis.gross_margin_trend_bps}
- Operating Margin Trend (bps): {reverse_analysis.operating_margin_trend_bps}
- Net Margin Trend (bps): {reverse_analysis.net_margin_trend_bps}
- Operating Leverage Score: {reverse_analysis.operating_leverage_score}
- Capital Intensity Ratio: {reverse_analysis.capital_intensity_ratio}
- Working Capital Efficiency: {reverse_analysis.working_capital_efficiency}

### Primary Revenue/Earnings Drivers
{drivers}

### Primary Risks
{risks}

## Forecast Highlights
- Year 1 Revenue: {y1.get("revenue")}
- Year 1 Net Income: {y1.get("net_income")}
- Final Year Revenue: {y_last.get("revenue")}
- Final Year Net Income: {y_last.get("net_income")}
- Final Year Implied EPS Growth: {y_last.get("implied_eps_growth")}

## Competitive Benchmark Snapshot
{peer_preview}
"""

