from __future__ import annotations

from dataclasses import asdict
from typing import Dict, List

import pandas as pd
import yfinance as yf

from .types import CompanySnapshot
from .utils import to_float


def _latest_row(df: pd.DataFrame) -> pd.Series | None:
    if df is None or df.empty:
        return None
    return df.iloc[:, 0]


def fetch_company_snapshot(ticker: str) -> CompanySnapshot:
    t = yf.Ticker(ticker)
    info = t.info or {}
    return CompanySnapshot(
        ticker=ticker.upper(),
        long_name=info.get("longName") or info.get("shortName") or ticker.upper(),
        sector=info.get("sector") or "Unknown",
        industry=info.get("industry") or "Unknown",
        market_cap=to_float(info.get("marketCap")),
        enterprise_value=to_float(info.get("enterpriseValue")),
        trailing_pe=to_float(info.get("trailingPE")),
        forward_pe=to_float(info.get("forwardPE")),
        price_to_sales=to_float(info.get("priceToSalesTrailing12Months")),
        ebitda_margin=to_float(info.get("ebitdaMargins")),
        gross_margin=to_float(info.get("grossMargins")),
        operating_margin=to_float(info.get("operatingMargins")),
        net_margin=to_float(info.get("profitMargins")),
        revenue_ttm=to_float(info.get("totalRevenue")),
        eps_ttm=to_float(info.get("trailingEps")),
    )


def fetch_financial_statements(ticker: str) -> Dict[str, pd.DataFrame]:
    t = yf.Ticker(ticker)
    earnings_trend_raw = None
    if hasattr(t, "earnings_trend"):
        earnings_trend_raw = getattr(t, "earnings_trend")
    elif hasattr(t, "get_earnings_trend"):
        try:
            earnings_trend_raw = t.get_earnings_trend()
        except Exception:
            earnings_trend_raw = None

    return {
        "income_stmt_annual": t.income_stmt.copy() if t.income_stmt is not None else pd.DataFrame(),
        "balance_sheet_annual": t.balance_sheet.copy() if t.balance_sheet is not None else pd.DataFrame(),
        "cashflow_annual": t.cashflow.copy() if t.cashflow is not None else pd.DataFrame(),
        "income_stmt_quarterly": t.quarterly_income_stmt.copy()
        if t.quarterly_income_stmt is not None
        else pd.DataFrame(),
        "earnings_trend": _safe_df(earnings_trend_raw),
    }


def _safe_df(value) -> pd.DataFrame:
    if value is None:
        return pd.DataFrame()
    if isinstance(value, pd.DataFrame):
        return value.copy()
    try:
        return pd.DataFrame(value)
    except Exception:
        return pd.DataFrame()


def fetch_peer_snapshots(competitors: List[str]) -> pd.DataFrame:
    rows = []
    for peer in competitors:
        try:
            snap = fetch_company_snapshot(peer)
            rows.append(asdict(snap))
        except Exception:
            rows.append(
                {
                    "ticker": peer.upper(),
                    "long_name": "Unavailable",
                    "sector": "Unknown",
                    "industry": "Unknown",
                    "market_cap": None,
                    "enterprise_value": None,
                    "trailing_pe": None,
                    "forward_pe": None,
                    "price_to_sales": None,
                    "ebitda_margin": None,
                    "gross_margin": None,
                    "operating_margin": None,
                    "net_margin": None,
                    "revenue_ttm": None,
                    "eps_ttm": None,
                }
            )
    return pd.DataFrame(rows)

