let revenueChart;
let incomeChart;

function fmtMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function fmtPct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function fmtNum(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";
  return Number(value).toFixed(2);
}

function tableCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function buildChart(el, labels, values, title, color) {
  return new Chart(el, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          tension: 0.3,
          borderColor: color,
          backgroundColor: "rgba(96,165,250,0.15)",
          fill: true,
          borderWidth: 2,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#cbd5e1",
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
        y: {
          ticks: { color: "#94a3b8", callback: (v) => fmtMoney(v) },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
      },
    },
  });
}

function renderCompany(data, ticker) {
  const company = data.companies[ticker];
  const snapshot = company.snapshot;
  const reverse = company.reverse_analysis;
  const annual = company.annual_forecast;

  document.getElementById("kpiRevenue").textContent = fmtMoney(snapshot.revenue_ttm);
  document.getElementById("kpiNetMargin").textContent = fmtPct(snapshot.net_margin);
  document.getElementById("kpiForwardPE").textContent = fmtNum(snapshot.forward_pe);
  document.getElementById("kpiCagr").textContent = fmtPct(reverse.revenue_cagr_3y);

  const driversEl = document.getElementById("driversList");
  const risksEl = document.getElementById("risksList");
  driversEl.innerHTML = "";
  risksEl.innerHTML = "";
  reverse.key_drivers.forEach((d) => {
    const li = document.createElement("li");
    li.textContent = d;
    driversEl.appendChild(li);
  });
  reverse.key_risks.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    risksEl.appendChild(li);
  });

  const body = document.querySelector("#peersTable tbody");
  body.innerHTML = "";
  company.peers.forEach((peer) => {
    const tr = document.createElement("tr");
    tr.appendChild(tableCell(peer.ticker));
    tr.appendChild(tableCell(fmtMoney(peer.market_cap)));
    tr.appendChild(tableCell(fmtNum(peer.forward_pe)));
    tr.appendChild(tableCell(fmtNum(peer.price_to_sales)));
    tr.appendChild(tableCell(fmtPct(peer.operating_margin)));
    body.appendChild(tr);
  });

  const labels = annual.map((x) => x.year);
  const revValues = annual.map((x) => Number(x.revenue));
  const niValues = annual.map((x) => Number(x.net_income));

  if (revenueChart) revenueChart.destroy();
  if (incomeChart) incomeChart.destroy();
  revenueChart = buildChart(document.getElementById("revenueChart"), labels, revValues, "Revenue", "#22d3ee");
  incomeChart = buildChart(document.getElementById("incomeChart"), labels, niValues, "Net Income", "#60a5fa");
}

async function init() {
  const response = await fetch("./sample-data.json");
  const data = await response.json();

  document.getElementById("productTitle").textContent = data.product_name;
  document.getElementById("productSubtitle").textContent = data.subtitle;

  const select = document.getElementById("companySelect");
  const tickers = Object.keys(data.companies);
  tickers.forEach((ticker) => {
    const option = document.createElement("option");
    option.value = ticker;
    option.textContent = `${ticker} - ${data.companies[ticker].snapshot.long_name}`;
    select.appendChild(option);
  });

  const first = tickers[0];
  select.value = first;
  renderCompany(data, first);

  select.addEventListener("change", (e) => renderCompany(data, e.target.value));
}

init();

