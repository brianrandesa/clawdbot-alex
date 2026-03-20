# Financial Modeling Robot AI

A production-oriented Python agent that reverse-analyzes public companies and builds a 12-month to 5-year financial model using:

- Historical fundamentals
- Core operating metrics
- Revenue and earnings trajectory
- Competitive peer benchmarks
- Scenario-based forecasting (bear/base/bull)

## What It Produces

For any ticker, the robot exports:

- `company_snapshot.json`: key company stats and valuation data
- `reverse_analysis.json`: trend diagnostics and KPI interpretation
- `peer_benchmark.csv`: side-by-side comp table versus competitors
- `forecast_monthly.csv`: 12-month monthly model
- `forecast_annual.csv`: annual model through year 5
- `executive_brief.md`: senior-exec style narrative summary

## Quick Start

```bash
cd financial-modeling-robot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m financial_modeling_robot.cli model \
  --ticker AAPL \
  --competitors MSFT,GOOGL,AMZN \
  --horizon-years 5 \
  --output-dir outputs/aapl
```

## CLI

```bash
python -m financial_modeling_robot.cli model \
  --ticker <TICKER> \
  --competitors <CSV_TICKERS> \
  --horizon-years <1-5> \
  --assumptions-file <optional_json> \
  --output-dir <path>
```

### Example with Assumptions Override

```bash
python -m financial_modeling_robot.cli model \
  --ticker NVDA \
  --competitors AMD,INTC,TSM \
  --horizon-years 5 \
  --assumptions-file examples/nvda_assumptions.json \
  --output-dir outputs/nvda
```

## Assumptions File Format

```json
{
  "scenario_weights": {
    "bear": 0.2,
    "base": 0.6,
    "bull": 0.2
  },
  "revenue_growth_overrides": {
    "year1": 0.18,
    "year2": 0.16,
    "year3": 0.14,
    "year4": 0.12,
    "year5": 0.1
  },
  "margin_overrides": {
    "gross_margin": 0.62,
    "operating_margin": 0.34,
    "net_margin": 0.28
  }
}
```

## Notes

- Designed for publicly traded companies using Yahoo Finance market/fundamental data.
- You can bring your own assumptions to enforce investment committee views.
- Treat outputs as decision support, not investment advice.
