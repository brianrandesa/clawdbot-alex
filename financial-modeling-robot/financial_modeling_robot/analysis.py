from __future__ import annotations

from typing import Dict, List

import numpy as np
import pandas as pd

from .types import ReverseAnalysis
from .utils import cagr, safe_divide, to_float


def _get_metric(df: pd.DataFrame, row_name: str, max_points: int = 4) -> List[float]:
    if df is None or df.empty or row_name not in df.index:
        return []
    values = df.loc[row_name].values.tolist()
    metric = [to_float(v) for v in values]
    metric = [v for v in metric if v is not None]
    return metric[:max_points]


def _trend_bps(series: List[float]) -> float | None:
    if len(series) < 2:
        return None
    start, end = series[-1], series[0]
    if start == 0:
        return None
    return (end - start) * 10000


def build_reverse_analysis(statements: Dict[str, pd.DataFrame]) -> ReverseAnalysis:
    income = statements["income_stmt_annual"]
    balance = statements["balance_sheet_annual"]
    cashflow = statements["cashflow_annual"]

    revenue = _get_metric(income, "Total Revenue")
    net_income = _get_metric(income, "Net Income")
    gross_profit = _get_metric(income, "Gross Profit")
    operating_income = _get_metric(income, "Operating Income")
    capex = _get_metric(cashflow, "Capital Expenditure")
    current_assets = _get_metric(balance, "Current Assets")
    current_liabilities = _get_metric(balance, "Current Liabilities")

    gross_margin_series = [safe_divide(gp, rev) for gp, rev in zip(gross_profit, revenue)]
    operating_margin_series = [safe_divide(op, rev) for op, rev in zip(operating_income, revenue)]
    net_margin_series = [safe_divide(ni, rev) for ni, rev in zip(net_income, revenue)]

    gross_margin_series = [m for m in gross_margin_series if m is not None]
    operating_margin_series = [m for m in operating_margin_series if m is not None]
    net_margin_series = [m for m in net_margin_series if m is not None]

    revenue_cagr_3y = cagr(revenue[-1], revenue[0], min(3, len(revenue) - 1)) if len(revenue) >= 2 else None
    eps_cagr_3y = cagr(net_income[-1], net_income[0], min(3, len(net_income) - 1)) if len(net_income) >= 2 else None

    gross_margin_trend = _trend_bps(gross_margin_series)
    op_margin_trend = _trend_bps(operating_margin_series)
    net_margin_trend = _trend_bps(net_margin_series)

    operating_leverage = None
    if revenue_cagr_3y is not None and eps_cagr_3y is not None and revenue_cagr_3y != 0:
        operating_leverage = eps_cagr_3y / revenue_cagr_3y

    capex_intensity = None
    if capex and revenue:
        capex_intensity = abs(safe_divide(capex[0], revenue[0]) or 0)

    wc_eff = None
    if current_assets and current_liabilities and revenue:
        wc = (current_assets[0] - current_liabilities[0]) if current_assets and current_liabilities else None
        wc_eff = safe_divide(wc, revenue[0]) if wc is not None else None

    drivers, risks = _derive_drivers_and_risks(
        gross_margin_trend=gross_margin_trend,
        op_margin_trend=op_margin_trend,
        revenue_cagr=revenue_cagr_3y,
        capex_intensity=capex_intensity,
        wc_eff=wc_eff,
    )

    return ReverseAnalysis(
        revenue_cagr_3y=revenue_cagr_3y,
        eps_cagr_3y=eps_cagr_3y,
        gross_margin_trend_bps=gross_margin_trend,
        operating_margin_trend_bps=op_margin_trend,
        net_margin_trend_bps=net_margin_trend,
        operating_leverage_score=operating_leverage,
        capital_intensity_ratio=capex_intensity,
        working_capital_efficiency=wc_eff,
        key_drivers=drivers,
        key_risks=risks,
    )


def _derive_drivers_and_risks(
    gross_margin_trend: float | None,
    op_margin_trend: float | None,
    revenue_cagr: float | None,
    capex_intensity: float | None,
    wc_eff: float | None,
) -> tuple[List[str], List[str]]:
    drivers: List[str] = []
    risks: List[str] = []

    if revenue_cagr is not None:
        if revenue_cagr > 0.15:
            drivers.append("High topline momentum (>15% CAGR) supports forward revenue scaling.")
        elif revenue_cagr > 0.05:
            drivers.append("Moderate topline growth indicates stable demand and expansion capacity.")
        else:
            risks.append("Low historical revenue CAGR suggests muted organic growth.")

    if gross_margin_trend is not None:
        if gross_margin_trend > 100:
            drivers.append("Gross margin expansion indicates pricing power or mix shift.")
        elif gross_margin_trend < -100:
            risks.append("Gross margin compression may reflect competitive or cost pressure.")

    if op_margin_trend is not None:
        if op_margin_trend > 100:
            drivers.append("Operating margin expansion signals operating leverage.")
        elif op_margin_trend < -100:
            risks.append("Operating margin deterioration suggests cost structure stress.")

    if capex_intensity is not None and capex_intensity > 0.12:
        risks.append("Elevated capex intensity increases reinvestment burden and execution risk.")
    elif capex_intensity is not None and capex_intensity < 0.05:
        drivers.append("Low capital intensity supports free cash conversion.")

    if wc_eff is not None and wc_eff > 0.20:
        risks.append("Working capital intensity is high versus sales, potentially constraining cash.")
    elif wc_eff is not None and wc_eff < 0.10:
        drivers.append("Efficient working capital profile supports liquidity and growth.")

    if not drivers:
        drivers.append("No dominant driver detected from available disclosures.")
    if not risks:
        risks.append("No acute structural risk flagged by current quantitative diagnostics.")

    return drivers, risks

