from __future__ import annotations

from dataclasses import asdict
from typing import List

import typer
from rich.console import Console
from rich.table import Table

from .analysis import build_reverse_analysis
from .data_sources import fetch_company_snapshot, fetch_financial_statements, fetch_peer_snapshots
from .modeling import build_financial_model
from .reporting import write_outputs
from .types import Assumptions
from .utils import load_json

app = typer.Typer(help="Financial Modeling Robot AI")
console = Console()


def _parse_competitors(raw: str) -> List[str]:
    if not raw:
        return []
    return [x.strip().upper() for x in raw.split(",") if x.strip()]


@app.command()
def model(
    ticker: str = typer.Option(..., help="Primary company ticker symbol."),
    competitors: str = typer.Option("", help="Comma-separated competitor tickers."),
    horizon_years: int = typer.Option(5, min=1, max=5, help="Forecast horizon (1-5 years)."),
    assumptions_file: str = typer.Option("", help="Optional JSON assumptions override file."),
    output_dir: str = typer.Option("outputs/model", help="Directory for generated outputs."),
) -> None:
    """
    Build reverse analysis + 12m to 5y financial model.
    """
    ticker = ticker.upper().strip()
    peer_list = _parse_competitors(competitors)

    console.print(f"[cyan]Running model for {ticker}...[/cyan]")
    snapshot = fetch_company_snapshot(ticker)
    statements = fetch_financial_statements(ticker)
    reverse_analysis = build_reverse_analysis(statements)
    peers_df = fetch_peer_snapshots(peer_list) if peer_list else fetch_peer_snapshots([ticker])

    override_data = load_json(assumptions_file) if assumptions_file else {}
    assumptions = Assumptions(
        scenario_weights=override_data.get("scenario_weights", {"bear": 0.2, "base": 0.6, "bull": 0.2}),
        revenue_growth_overrides=override_data.get("revenue_growth_overrides", {}),
        margin_overrides=override_data.get("margin_overrides", {}),
    )

    monthly_df, annual_df = build_financial_model(
        snapshot=snapshot,
        reverse_analysis=reverse_analysis,
        assumptions=assumptions,
        horizon_years=horizon_years,
    )
    outputs = write_outputs(
        output_dir=output_dir,
        snapshot=snapshot,
        reverse_analysis=reverse_analysis,
        peers_df=peers_df,
        monthly_df=monthly_df,
        annual_df=annual_df,
    )

    table = Table(title=f"Financial Modeling Robot: {ticker}")
    table.add_column("Output")
    table.add_column("Path")
    for k, v in outputs.items():
        table.add_row(k, v)
    console.print(table)

    console.print("[green]Model build complete.[/green]")


if __name__ == "__main__":
    app()

