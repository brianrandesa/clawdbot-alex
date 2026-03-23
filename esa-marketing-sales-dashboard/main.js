(function () {
  'use strict';

  /** Bump when KPI layout changes; footer shows this so you know the browser loaded THIS file (not a cached old main.js). */
  var ESA_UI_BUILD = 'no-banner-20260324';

  var BENCHMARKS = {
    conservative: { adSpend:10000, leads:200, bookedCalls:67, leadBookPct:33.33, liveCalls:33, cpl:50, costPerBooking:150, costPerLive:300, showRate:40, offerRate:50, closeRate:15, cpa:2000, aov:9800, cashCollectedPct:40, avgUpfrontCash:3920, upfrontRoas:1.96 },
    baseCase:     { adSpend:10000, leads:250, bookedCalls:100, leadBookPct:40, liveCalls:40, cpl:40, costPerBooking:100, costPerLive:250, showRate:50, offerRate:70, closeRate:20, cpa:1250, aov:9800, cashCollectedPct:50, avgUpfrontCash:4900, upfrontRoas:3.92 },
    optimized:    { adSpend:10000, leads:333, bookedCalls:143, leadBookPct:42.86, liveCalls:50, cpl:30, costPerBooking:70, costPerLive:200, showRate:65, offerRate:80, closeRate:25, cpa:800, aov:9800, cashCollectedPct:60, avgUpfrontCash:5880, upfrontRoas:7.35 }
  };

  var currentData = null;

  function round(n, d) { d = d || 2; return Math.round(n * Math.pow(10, d)) / Math.pow(10, d); }
  function money(n) { return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }); }
  function pct(n) { return round(n, 1) + '%'; }
  function el(id) { return document.getElementById(id); }

  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Legacy pages only had #kpi-top + #kpi-bottom (13 KPI cells). New UI uses #kpi-main-18 (18 cells).
   * If main.js updated but HTML cached (or vice versa), upgrade the DOM once so all 18 cards render.
   */
  function ensureKpiMain18Host() {
    var tab = el('tab-dashboard');
    if (!tab) return null;
    var m = el('kpi-main-18');
    if (!m) {
      m = document.createElement('section');
      m.id = 'kpi-main-18';
      m.className = 'kpi-row kpi-grid-18';
    }
    // Always ensure it's the first visible child of the dashboard tab
    var banner = el('dashboard-ghl-banner');
    var after = banner && banner.parentNode === tab ? banner.nextSibling : tab.firstChild;
    if (m.parentNode !== tab || m !== after) {
      tab.insertBefore(m, after);
    }
    var top = el('kpi-top');
    var bottom = el('kpi-bottom');
    if (top && top.parentNode) top.parentNode.removeChild(top);
    if (bottom && bottom.parentNode) bottom.parentNode.removeChild(bottom);
    return m;
  }

  // ---- TABS ----
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
      var tab = btn.getAttribute('data-tab');
      el('tab-dashboard').style.display = tab === 'dashboard' ? '' : 'none';
      el('tab-rawdata').style.display = tab === 'rawdata' ? '' : 'none';
      el('tab-snapshot').style.display = tab === 'snapshot' ? '' : 'none';
      el('tab-submissions').style.display = tab === 'submissions' ? '' : 'none';
      el('tab-salesboard').style.display = tab === 'salesboard' ? '' : 'none';
      el('tab-salesboard-v2').style.display = tab === 'salesboard-v2' ? '' : 'none';
      var metaTab = el('tab-meta-ads');
      if (metaTab) metaTab.style.display = tab === 'meta-ads' ? '' : 'none';
      el('tab-sales').style.display = tab === 'sales' ? '' : 'none';
      if (tab === 'sales') initLogDealForm();
      if (tab === 'submissions' || tab === 'salesboard') refreshSalesTabs();
      if (tab === 'salesboard-v2') renderSalesBoardV2();
      if (tab === 'meta-ads') renderMetaAdsTab();
      if (tab === 'snapshot' && currentData) renderSnapshot(currentData);
      try {
        if (tab === 'dashboard') {
          history.replaceState(null, '', location.pathname + location.search || '.');
        } else {
          history.replaceState(null, '', '#' + tab);
        }
      } catch (e) { /* ignore */ }
    });
  });

  function applyHashTab() {
    var h = (location.hash || '').replace(/^#/, '').split('?')[0];
    if (!h) return;
    var btn = document.querySelector('.tab[data-tab="' + h + '"]');
    if (btn) btn.click();
  }
  applyHashTab();
  window.addEventListener('hashchange', applyHashTab);

  var DEAL_STAGE_CLOSED_WON = '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254';
  var logDealOptsLoaded = false;
  var logDealSubmitBound = false;
  var logDealDashboardCheckboxBound = false;

  function updateDealSubmitButtonLabel() {
    var dash = el('deal-dashboard-only') && el('deal-dashboard-only').checked;
    var btn = el('deal-submit');
    if (btn) btn.textContent = dash ? 'Save to dashboard only' : 'Create in GHL';
  }

  function initLogDealForm() {
    var saved = localStorage.getItem('esa.dealUploadSecret');
    if (saved) el('deal-secret').value = saved;

    if (!logDealDashboardCheckboxBound && el('deal-dashboard-only')) {
      logDealDashboardCheckboxBound = true;
      el('deal-dashboard-only').addEventListener('change', updateDealSubmitButtonLabel);
    }
    updateDealSubmitButtonLabel();

    if (!logDealOptsLoaded) {
      logDealOptsLoaded = true;
      fetch('/api/deal-form-config')
        .then(function (res) { return res.json(); })
        .then(function (cfg) {
          var st = el('deal-stage');
          var so = el('deal-source');
          st.innerHTML = (cfg.stages || []).map(function (s) {
            return '<option value="' + esc(s.id) + '"' + (s.name === 'Closed Won' ? ' selected' : '') + '>' + esc(s.name) + '</option>';
          }).join('');
          so.innerHTML = (cfg.sources || []).map(function (s) {
            return '<option value="' + esc(s.tag) + '"' + (s.tag === 'src-organic' ? ' selected' : '') + '>' + esc(s.label) + '</option>';
          }).join('');
        })
        .catch(function () {
          el('deal-status').textContent = 'Could not load stages (check deploy).';
          el('deal-status').className = 'deal-status err';
        });
    }

    if (!logDealSubmitBound) {
      logDealSubmitBound = true;
      el('deal-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var statusEl = el('deal-status');
        var btn = el('deal-submit');
        statusEl.className = 'deal-status';
        statusEl.textContent = 'Sending…';
        btn.disabled = true;

        var secret = el('deal-secret').value.trim();
        if (el('deal-remember-secret').checked && secret) {
          localStorage.setItem('esa.dealUploadSecret', secret);
        } else if (!el('deal-remember-secret').checked) {
          localStorage.removeItem('esa.dealUploadSecret');
        }

        var prodSel = el('deal-product').value;
        var prodCustom = el('deal-product-custom').value.trim();
        var product = prodSel === '__custom' ? prodCustom : (prodSel || prodCustom);
        if (!product) {
          statusEl.className = 'deal-status err';
          statusEl.textContent = 'Choose a product or pick Other and type the name.';
          btn.disabled = false;
          return;
        }

        var amt = parseFloat(el('deal-value').value, 10);
        if (Number.isNaN(amt) || amt < 0) {
          statusEl.className = 'deal-status err';
          statusEl.textContent = 'Enter a valid amount paid.';
          btn.disabled = false;
          return;
        }

        var owedRaw = el('deal-amount-owed').value.trim();
        var amountOwed = owedRaw === '' ? 0 : parseFloat(owedRaw, 10);
        if (owedRaw !== '' && (Number.isNaN(amountOwed) || amountOwed < 0)) {
          statusEl.className = 'deal-status err';
          statusEl.textContent = 'Amount owed must be empty or a number ≥ 0.';
          btn.disabled = false;
          return;
        }

        var payload = {
          secret: secret,
          fathom1: el('deal-fathom1').value.trim(),
          fathom2: el('deal-fathom2').value.trim(),
          dateCreated: el('deal-date-created').value,
          dateFirstCall: el('deal-date-first-call').value,
          datePayment: el('deal-date-payment').value,
          closingDate: el('deal-date-closing').value,
          clientOrEvent: el('deal-client-event').value.trim(),
          firstName: el('deal-first').value.trim(),
          lastName: el('deal-last').value.trim(),
          email: el('deal-email').value.trim(),
          phone: el('deal-phone').value.trim(),
          product: product,
          monetaryValue: amt,
          amountOwed: amountOwed,
          setter: el('deal-setter').value.trim(),
          setterPct: el('deal-setter-pct').value.trim(),
          closer: el('deal-closer').value.trim(),
          closerComm: el('deal-closer-comm').value.trim(),
          leadSource: el('deal-lead-source').value.trim(),
          campaign: el('deal-campaign').value.trim(),
          adset: el('deal-adset').value.trim(),
          ad: el('deal-ad').value.trim(),
          dealTitle: el('deal-title').value.trim(),
          pipelineStageId: el('deal-stage').value,
          sourceTag: el('deal-source').value,
          paymentPlan: el('deal-payment-plan').checked,
          notes: el('deal-notes').value.trim(),
          dashboardOnly: !!(el('deal-dashboard-only') && el('deal-dashboard-only').checked)
        };

        fetch('/api/deal-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, status: res.status, j: j }; }); })
          .then(function (r) {
            if (r.ok && r.j.ok) {
              statusEl.className = 'deal-status ok';
              if (r.j.dashboardOnly) {
                statusEl.textContent = r.j.message || 'Saved.';
              } else {
                statusEl.textContent =
                  r.j.message +
                  ' Contact: ' +
                  (r.j.contactId || '') +
                  ' · Opp: ' +
                  (r.j.opportunityId || '(see GHL)');
              }
              el('deal-form').reset();
              el('deal-product').selectedIndex = 0;
              el('deal-product-custom').value = '';
              el('deal-payment-plan').checked = false;
              if (el('deal-dashboard-only')) el('deal-dashboard-only').checked = false;
              updateDealSubmitButtonLabel();
              el('deal-stage').value = DEAL_STAGE_CLOSED_WON;
              el('deal-source').value = 'src-organic';
              if (el('deal-remember-secret').checked && secret) el('deal-secret').value = secret;
              refreshSalesTabs();
            } else {
              statusEl.className = 'deal-status err';
              statusEl.textContent = (r.j && r.j.error) ? r.j.error : ('HTTP ' + r.status);
              if (r.j && r.j.hint) statusEl.textContent += ' — ' + r.j.hint;
              if (r.j && r.j.ghlStatus)
                statusEl.textContent += ' (GHL HTTP ' + r.j.ghlStatus + ')';
              if (r.j && r.j.ghl) {
                var g = r.j.ghl;
                var gmsg =
                  (typeof g === 'string' && g) ||
                  g.message ||
                  g.error ||
                  g.msg ||
                  (g.meta && (g.meta.message || g.meta.error)) ||
                  '';
                if (!gmsg && Array.isArray(g.errors) && g.errors.length)
                  gmsg = g.errors.map(function (e) { return e && (e.message || e.msg || JSON.stringify(e)); }).join('; ');
                if (!gmsg) {
                  try {
                    gmsg = JSON.stringify(g);
                  } catch (e2) {
                    gmsg = '';
                  }
                  if (gmsg.length > 280) gmsg = gmsg.slice(0, 277) + '…';
                }
                if (gmsg) statusEl.textContent += ' · ' + gmsg;
              }
            }
          })
          .catch(function (e) {
            statusEl.className = 'deal-status err';
            statusEl.textContent = e.message || 'Network error';
          })
          .then(function () { btn.disabled = false; });
      });
    }
  }

  // ---- KPIs ----
  function renderKPIs(data) {
    var sc = data.statusCounts || {};
    var topCards = [
      { label: 'Meta Results', value: (data.metaLeads || 0).toLocaleString(), sub: 'Same metric family as Ads Manager Results', delta: null },
      { label: 'GHL Leads', value: data.leads, sub: 'Synced to CRM (' + data.dateRange + ')', delta: null },
      { label: 'Booked Calls', value: sc.booked || data.bookedCalls, sub: pct(data.leadBookPct) + ' of leads', delta: benchmarkDelta('leadBookPct', data.leadBookPct) },
      { label: 'Showed', value: sc.showed || data.liveCalls, sub: pct(data.showRate) + ' show rate', delta: benchmarkDelta('showRate', data.showRate) },
      { label: 'Offers Made', value: sc.offered || 0, sub: pct(data.offerRate) + ' offer rate', delta: benchmarkDelta('offerRate', data.offerRate) },
      { label: 'Contracts Sent', value: sc.contractSent || 0, sub: 'Awaiting signature', delta: null }
    ];
    var revSrc = (data.revenueModel && data.revenueModel.source === 'google_sheets') ? 'Google Sheet (in range)' : 'GHL opp $ (in range)';
    var sheetWarn = (data.sheetRevenue && data.sheetRevenue.warning) ? ' · ' + data.sheetRevenue.warning : '';
    var strip = data.marketingKpiStrip || {};
    var deals = data.closedWonDeals || [];
    function sumDealField(rows, key) {
      var t = 0;
      for (var i = 0; i < rows.length; i++) t += Number(rows[i][key]) || 0;
      return Math.round(t * 100) / 100;
    }
    var tcvFromDeals = sumDealField(deals, 'amount');
    var cashFromDeals = sumDealField(deals, 'cashCollected');
    var useSheetTcv = strip.tcvSource === 'google_sheet';
    var revNum = Number(data.revenue) || 0;
    var rawStripTcv =
      strip.totalContractValue != null && strip.totalContractValue !== ''
        ? Number(strip.totalContractValue)
        : null;
    var tcvSheetHeadline =
      rawStripTcv != null ? rawStripTcv : revNum;
    var tcvStripOrRevFallback =
      rawStripTcv != null && rawStripTcv > 0
        ? rawStripTcv
        : revNum > 0
          ? revNum
          : rawStripTcv === 0
            ? 0
            : revNum;
    var tcv =
      useSheetTcv
        ? tcvSheetHeadline
        : deals.length > 0
          ? tcvFromDeals
          : tcvStripOrRevFallback;
    var mode = strip.cashMode || 'none';
    var cash =
      mode === 'none'
        ? 0
        : deals.length > 0
          ? cashFromDeals
          : Number(strip.totalCashCollected != null ? strip.totalCashCollected : 0) || 0;
    var closedWonSubMoney = useSheetTcv ? Number(data.revenue) || 0 : tcv;
    var bottomCards = [
      { label: 'Closed Won', value: sc.closedWonDeals != null ? sc.closedWonDeals : sc.closedWon, sub: money(closedWonSubMoney) + ' · ' + revSrc + sheetWarn, delta: null },
      { label: 'Closed Lost', value: sc.closedLost || 0, sub: 'Dead deals', delta: null },
      { label: 'No Show', value: sc.noShow || 0, sub: 'Calendar no-show / cancelled', delta: null },
      { label: 'Ad Spend', value: data.adSpend > 0 ? money(data.adSpend) : '--', sub: (data.adSource || 'No data') + (data.metaImpressions ? ' | ' + data.metaImpressions.toLocaleString() + ' impr' : ''), delta: null },
      { label: 'CPL', value: data.cpl > 0 ? money(data.cpl) : '--', sub: 'Cost per lead', delta: data.cpl > 0 ? benchmarkDelta('cpl', data.cpl, true) : null },
      { label: 'Cost / Booking', value: data.costPerBooking > 0 ? money(data.costPerBooking) : '--', sub: 'Cost per booked call', delta: data.costPerBooking > 0 ? benchmarkDelta('costPerBooking', data.costPerBooking, true) : null }
    ];
    var tcvSub =
      strip.tcvSource === 'google_sheet'
        ? 'From Google Sheet'
        : 'All Closed Won deals';
    var cashSub =
      mode === 'custom_field'
        ? 'Payments received to date'
        : mode === 'matches_contract'
          ? 'Full contract value at close'
          : 'Not configured';
    var topTcvSrc = strip.topTcvBySource || [];
    var tr1 = topTcvSrc[0] || { label: '—', tcv: 0, cash: 0 };
    var tr2 = topTcvSrc[1] || { label: '—', tcv: 0, cash: 0 };
    function rowCsourceSub(rank, r) {
      var cashLine = mode === 'none'
        ? ''
        : 'Cash in: ' + money(r.cash);
      return '#' + rank + ' lead source' + (cashLine ? ' · ' + cashLine : '');
    }
    var rowC = [
      {
        label: 'Upfront ROAS',
        value: data.upfrontRoas > 0 ? data.upfrontRoas + 'x' : '--',
        sub: 'Revenue / spend',
        delta: data.upfrontRoas > 0 ? benchmarkDelta('upfrontRoas', data.upfrontRoas) : null
      },
      { label: 'Total contract value (TCV)', value: money(tcv), sub: tcvSub, revenue: true, delta: null },
      { label: 'Total cash collected', value: money(cash), sub: cashSub, revenue: true, delta: null },
      {
        label: 'TCV · ' + tr1.label,
        value: money(tr1.tcv),
        sub: rowCsourceSub(1, tr1),
        revenue: true,
        delta: null
      },
      {
        label: 'TCV · ' + tr2.label,
        value: money(tr2.tcv),
        sub: rowCsourceSub(2, tr2),
        revenue: true,
        delta: null
      },
      {
        label: 'AOV (avg deal)',
        value: data.aov > 0 ? money(data.aov) : '--',
        sub: 'Revenue ÷ Closed Won deals',
        delta: data.aov > 0 ? benchmarkDelta('aov', data.aov) : null
      }
    ];
    // Row D — per-source TCV + cash + efficiency metrics
    var bySrc = data.bySource || [];
    function srcObj(tag) {
      for (var i = 0; i < bySrc.length; i++) { if (bySrc[i].tag === tag) return bySrc[i]; }
      return { label: '—', leads: 0, booked: 0, showed: 0, offered: 0, closed: 0, revenue: 0 };
    }
    function srcCash(tag) {
      for (var i = 0; i < deals.length; i++) { if (deals[i].sourceTag === tag) return Number(deals[i].cashCollected) || 0; }
      return 0;
    }
    function sumSrcCash(tag) {
      var t = 0;
      for (var i = 0; i < deals.length; i++) { if (deals[i].sourceTag === tag) t += Number(deals[i].cashCollected) || 0; }
      return t;
    }
    function sumSrcTcv(tag) {
      var t = 0;
      for (var i = 0; i < deals.length; i++) { if (deals[i].sourceTag === tag) t += Number(deals[i].amount) || 0; }
      return t;
    }
    var fbSrc = srcObj('src-fb-lead-form-ss');
    var fbTcv = sumSrcTcv('src-fb-lead-form-ss');
    var fbCash = sumSrcCash('src-fb-lead-form-ss');
    var brianSrc = srcObj('src-brian-direct');
    var brianTcv = sumSrcTcv('src-brian-direct');
    var brianCash = sumSrcCash('src-brian-direct');
    var collectionRate = tcv > 0 ? Math.round((cash / tcv) * 10000) / 100 : 0;
    var liveCalls = sc.showed || data.liveCalls || 0;
    var revenuePerLive = liveCalls > 0 ? Math.round(tcv / liveCalls) : 0;
    var closedWonCount = sc.closedWonDeals != null ? sc.closedWonDeals : (sc.closedWon || 0);
    var dealsInPipeline = (sc.offered || 0) + (sc.contractSent || 0);
    var pipelineVal = dealsInPipeline * (data.aov > 0 ? data.aov : 15000);
    var rowD = [
      { label: 'TCV · FB Lead Forms', value: fbTcv > 0 ? money(fbTcv) : '$0', sub: fbSrc.closed + ' deal' + (fbSrc.closed !== 1 ? 's' : '') + ' from Meta leads', revenue: true, delta: null },
      { label: 'Cash · FB Lead Forms', value: fbCash > 0 ? money(fbCash) : '$0', sub: fbTcv > 0 ? pct(Math.round(fbCash / fbTcv * 10000) / 100) + ' collected' : 'No closed deals yet', revenue: true, delta: null },
      { label: "TCV · Brian's Network", value: brianTcv > 0 ? money(brianTcv) : '$0', sub: brianSrc.closed + ' deal' + (brianSrc.closed !== 1 ? 's' : '') + ' from direct/referral', revenue: true, delta: null },
      { label: "Cash · Brian's Network", value: brianCash > 0 ? money(brianCash) : '$0', sub: brianTcv > 0 ? pct(Math.round(brianCash / brianTcv * 10000) / 100) + ' collected' : 'No closed deals yet', revenue: true, delta: null },
      { label: 'Collection Rate', value: pct(collectionRate), sub: money(cash) + ' of ' + money(tcv) + ' collected', delta: null },
      { label: 'Revenue / Live Call', value: revenuePerLive > 0 ? money(revenuePerLive) : '--', sub: liveCalls + ' showed · ' + money(tcv) + ' TCV', delta: null }
    ];

    // ---- SS Lead Form (Sam) row ----
    var lf = data.leadFormMarketing || {};
    var lfTotal = lf.total || 0, lfBooked = lf.booked || 0, lfDiamond = lf.bookedByDiamond || 0;
    var lfMetaR = lf.metaSSLeadFormResults || 0, lfMetaSp = lf.metaSSLeadFormSpend || 0;
    var lfUseMeta = lfMetaR > 0;
    var lfPrimary = lfUseMeta ? lfMetaR : lfTotal;
    var lfUnbooked = lfUseMeta ? Math.max(0, lfMetaR - lfBooked) : Math.max(0, lfTotal - lfBooked);
    var lfBookPct = lfUseMeta && lfMetaR ? (lfBooked / lfMetaR) * 100 : (lfTotal ? lf.bookRatePct || 0 : 0);
    var lfClosed = 0, lfTcv2 = 0, lfCash2 = 0;
    for (var li = 0; li < deals.length; li++) { if (deals[li].sourceTag === 'src-fb-lead-form-ss') { lfClosed++; lfTcv2 += Number(deals[li].amount) || 0; lfCash2 += Number(deals[li].cashCollected) || 0; } }
    var lfShowed = 0;
    for (var lk = 0; lk < bySrc.length; lk++) { if (bySrc[lk].tag === 'src-fb-lead-form-ss') { lfShowed = bySrc[lk].showed || 0; break; } }
    var rowSS = [
      { label: 'SS Leads', value: lfPrimary.toLocaleString(), sub: lfUseMeta ? money(lfMetaSp) + ' spend' : lfTotal + ' GHL tags', marketing: true },
      { label: 'SS Booked', value: lfBooked.toLocaleString(), sub: pct(lfBookPct) + ' book rate', marketing: true },
      { label: 'SS Diamond', value: lfDiamond.toLocaleString(), sub: lfBooked ? pct(lf.diamondShareOfBookedPct || 0) + ' of booked' : '--', marketing: true },
      { label: 'SS Showed', value: lfShowed.toLocaleString(), sub: lfBooked > 0 ? pct(Math.round(lfShowed / lfBooked * 10000) / 100) + ' show rate' : '--', marketing: true },
      { label: 'SS Closed', value: lfClosed.toLocaleString(), sub: lfShowed > 0 ? pct(Math.round(lfClosed / lfShowed * 10000) / 100) + ' close rate' : '--', marketing: true },
      { label: 'SS Cash', value: money(lfCash2), sub: money(lfTcv2) + ' TCV', marketing: true }
    ];

    // ---- VSL Funnel row ----
    var vC = 0, vTT = 0, vCa = 0;
    for (var vi = 0; vi < deals.length; vi++) { if (deals[vi].sourceTag === 'src-vsl') { vC++; vTT += Number(deals[vi].amount) || 0; vCa += Number(deals[vi].cashCollected) || 0; } }
    var vL = 0, vB = 0, vSh = 0, vO = 0;
    for (var vj = 0; vj < bySrc.length; vj++) { if (bySrc[vj].tag === 'src-vsl') { vL = bySrc[vj].leads || 0; vB = bySrc[vj].booked || 0; vSh = bySrc[vj].showed || 0; vO = bySrc[vj].offered || 0; break; } }
    var rowVSL = [
      { label: 'VSL Leads', value: vL.toLocaleString(), sub: 'Quiz / landing page', marketing: true },
      { label: 'VSL Booked', value: vB.toLocaleString(), sub: pct(vL > 0 ? Math.round(vB / vL * 10000) / 100 : 0) + ' book rate', marketing: true },
      { label: 'VSL Showed', value: vSh.toLocaleString(), sub: pct(vB > 0 ? Math.round(vSh / vB * 10000) / 100 : 0) + ' show rate', marketing: true },
      { label: 'VSL Offers', value: vO.toLocaleString(), sub: vSh > 0 ? pct(Math.round(vO / vSh * 10000) / 100) + ' offer rate' : '--', marketing: true },
      { label: 'VSL Closed', value: vC.toLocaleString(), sub: vSh > 0 ? pct(Math.round(vC / vSh * 10000) / 100) + ' close rate' : '--', marketing: true },
      { label: 'VSL Cash', value: money(vCa), sub: money(vTT) + ' TCV', marketing: true }
    ];

    var all36 = rowSS.concat(rowVSL).concat(topCards).concat(bottomCards).concat(rowC).concat(rowD);
    var main18 = ensureKpiMain18Host();
    if (main18) {
      main18.className = 'kpi-row kpi-grid-18';
      main18.style.display = '';
      main18.setAttribute('data-kpi-count', String(all36.length));
      main18.innerHTML = all36.map(kpiHTML).join('');
    }
  }

  function kpiHTML(c) {
    var d = c.delta ? ' <span class="kpi-delta ' + c.delta.dir + '">' + esc(c.delta.text) + '</span>' : '';
    var mk = c.marketing ? ' kpi-marketing' : '';
    var rev = c.revenue ? ' kpi-revenue' : '';
    return (
      '<div class="kpi' +
      mk +
      rev +
      '"><div class="kpi-label">' +
      esc(c.label) +
      '</div><div class="kpi-value">' +
      esc(String(c.value)) +
      '</div><div class="kpi-sub">' +
      esc(c.sub) +
      d +
      '</div></div>'
    );
  }

  function benchmarkDelta(key, actual, lowerIsBetter) {
    var base = BENCHMARKS.baseCase[key];
    if (!base || !actual) return null;
    var diff = round(((actual - base) / base) * 100, 1);
    var dir = (lowerIsBetter ? diff <= 0 : diff >= 0) ? 'up' : 'down';
    if (Math.abs(diff) < 3) dir = 'neutral';
    return { dir: dir, text: (diff >= 0 ? '+' : '') + diff + '% vs base' };
  }

  // ---- Benchmark Table ----
  function renderBenchmarkTable(data) {
    var rows = [
      { label:'Ad Spend', key:'adSpend', fmt:money }, { label:'Leads', key:'leads', fmt:String }, { label:'Booked Calls', key:'bookedCalls', fmt:String },
      { label:'Lead/Booking %', key:'leadBookPct', fmt:pct }, { label:'Live Calls', key:'liveCalls', fmt:String },
      { label:'CPL', key:'cpl', fmt:money, lower:true }, { label:'Cost/Booking', key:'costPerBooking', fmt:money, lower:true },
      { label:'Cost/Live', key:'costPerLive', fmt:money, lower:true }, { label:'Show Rate', key:'showRate', fmt:pct },
      { label:'Offer Rate', key:'offerRate', fmt:pct }, { label:'Close Rate', key:'closeRate', fmt:pct },
      { label:'CPA', key:'cpa', fmt:money, lower:true }, { label:'AOV', key:'aov', fmt:money },
      { label:'Cash Collected %', key:'cashCollectedPct', fmt:pct }, { label:'Avg Upfront Cash', key:'avgUpfrontCash', fmt:money },
      { label:'Upfront ROAS', key:'upfrontRoas', fmt:function(n){ return n+'x'; } }
    ];
    el('benchmark-table').querySelector('tbody').innerHTML = rows.map(function(r) {
      var a = data[r.key], c = BENCHMARKS.conservative[r.key], b = BENCHMARKS.baseCase[r.key], o = BENCHMARKS.optimized[r.key];
      var st = getStatus(a, c, b, o, r.lower);
      return '<tr><td><strong>'+r.label+'</strong></td><td>'+r.fmt(c)+'</td><td>'+r.fmt(b)+'</td><td>'+r.fmt(o)+'</td><td class="col-actual" style="font-weight:700">'+r.fmt(a)+'</td><td><span class="badge '+st.cls+'">'+st.text+'</span></td></tr>';
    }).join('');
  }

  function getStatus(a, c, b, o, lower) {
    if (lower) {
      if (a <= o) return {cls:'above',text:'Crushing It'}; if (a <= b) return {cls:'above',text:'Above Base'};
      if (a <= c) return {cls:'at',text:'On Track'}; return {cls:'below',text:'Below Target'};
    }
    if (a >= o) return {cls:'above',text:'Crushing It'}; if (a >= b) return {cls:'above',text:'Above Base'};
    if (a >= c) return {cls:'at',text:'On Track'}; if (a > 0) return {cls:'below',text:'Below Target'};
    return {cls:'below',text:'No Data'};
  }

  // ---- Funnel ----
  function renderFunnel(data) {
    var sc = data.statusCounts || {};
    var top = sc.newLead || data.leads || 1;
    var steps = [
      {label:'New Leads', val:sc.newLead||data.leads, fill:'fill-blue'}, {label:'Booked', val:sc.booked||0, fill:'fill-blue'},
      {label:'Showed', val:sc.showed||0, fill:'fill-green'}, {label:'Offers Made', val:sc.offered||0, fill:'fill-amber'},
      {label:'Contracts Sent', val:sc.contractSent||0, fill:'fill-amber'}, {label:'Closed Won', val:sc.closedWon||0, fill:'fill-green'}
    ];
    el('funnel').innerHTML = steps.map(function(s,i) {
      var w = Math.max(3,(s.val/top)*100);
      var prev = i>0 ? steps[i-1].val : top;
      var conv = i>0 && prev>0 ? ' ('+round((s.val/prev)*100,1)+'% from prev)' : '';
      return '<div class="funnel-step"><div class="funnel-meta"><span class="label">'+s.label+'</span><span class="nums">'+s.val+conv+'</span></div><div class="funnel-track"><div class="funnel-fill '+s.fill+'" style="width:'+w+'%"></div></div></div>';
    }).join('');
  }

  // ---- Source ----
  function renderSourceTable(data) {
    el('source-table').innerHTML = (data.bySource||[]).map(function(s) {
      return '<tr><td><strong>'+s.label+'</strong></td><td>'+s.leads+'</td><td>'+s.booked+'</td><td>'+s.showed+'</td><td>'+s.closed+'</td><td>'+money(s.revenue)+'</td></tr>';
    }).join('');
  }

  /** Marketing dashboard: list each GHL Closed Won opp in the revenue date window (e.g. your two $5k wins) with inferred source from tags. */
  function renderClosedWonGhlTable(data) {
    var tbody = el('closed-won-ghl-tbody');
    var panel = el('closed-won-ghl-panel');
    if (!tbody || !panel) return;
    var rows = data.closedWonDeals || [];
    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="9">No <strong>Closed Won</strong> opportunities in this range in GHL. Try <strong>All Time</strong> or widen custom dates. Opps must have <code>monetaryValue</code> or <code>GHL_DEAL_VALUE_FALLBACK</code> set on Vercel.</td></tr>';
      return;
    }
    tbody.innerHTML = rows
      .map(function (r) {
        var srcHtml =
          '<strong>' + esc(r.sourceLabel) + '</strong>' +
          (r.sourceTag && r.sourceTag !== 'unknown'
            ? ' <span class="mono">' + esc(r.sourceTag) + '</span>'
            : '');
        var amt = money(r.amount);
        if (r.usedFallback) amt += ' *';
        var cashCell = money(r.cashCollected != null ? r.cashCollected : 0);
        var big = r.amount >= 4500 ? ' closed-won-big' : '';
        var opp = (r.opportunityName || '').trim() || r.opportunityId || '—';
        return (
          '<tr class="' +
          big.trim() +
          '"><td>' +
          amt +
          '</td><td>' +
          cashCell +
          '</td><td>' +
          esc(r.contactName) +
          '</td><td>' +
          esc(r.email) +
          '</td><td>' +
          srcHtml +
          '</td><td>' +
          esc(r.assignedTo) +
          '</td><td>' +
          esc(r.closedAt ? String(r.closedAt).slice(0, 10) : '—') +
          '</td><td>' +
          esc(opp) +
          '</td><td class="muted tags-snippet">' +
          esc(r.tagsPreview || '—') +
          '</td></tr>'
        );
      })
      .join('');
  }

  var SHEET_ATTR_TABLE_MAX = 12;

  function renderSheetAttributionTable(title, rows) {
    if (!rows || !rows.length) return '';
    var slice = rows.slice(0, SHEET_ATTR_TABLE_MAX);
    var body = slice.map(function (x) {
      return (
        '<tr><td><strong>' +
        esc(x.key) +
        '</strong></td><td>' +
        money(x.revenue) +
        '</td><td>' +
        x.count +
        '</td></tr>'
      );
    }).join('');
    if (rows.length > SHEET_ATTR_TABLE_MAX) {
      body +=
        '<tr><td colspan="3" class="muted">+' +
        (rows.length - SHEET_ATTR_TABLE_MAX) +
        ' more</td></tr>';
    }
    return (
      '<article class="panel sheet-attrib-card">' +
      '<div class="panel-head"><h3>' +
      esc(title) +
      '</h3></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Value</th><th>Revenue</th><th>Rows</th></tr></thead><tbody>' +
      body +
      '</tbody></table></div></article>'
    );
  }

  function renderSheetAttribution(data) {
    var panel = el('sheet-attribution-panel');
    var grid = el('sheet-attribution-grid');
    var statusEl = el('sheet-attribution-status');
    if (!panel || !grid) return;

    var sa = data.sheetAttribution;
    if (!sa || !sa.rowsInRange) {
      panel.style.display = 'none';
      return;
    }

    panel.style.display = '';
    var sr = data.sheetRevenue || {};
    var bits = [];
    bits.push(sa.rowsInRange + ' paid rows in range from the sheet.');
    if (sr.attributionOnlyNote) bits.push(sr.attributionOnlyNote);
    if (data.revenueModel && data.revenueModel.source === 'google_sheets') bits.push('Revenue KPIs use this sheet.');
    if (statusEl) statusEl.textContent = bits.join(' ');

    var L = sa.columnLabels || {};
    var det = sa.columnsDetected || {};
    function wantDim(key, list) {
      if (!det[key]) return false;
      return list && list.length > 0;
    }
    var parts = [];
    if (wantDim('leadSource', sa.byLeadSource))
      parts.push(renderSheetAttributionTable(L.leadSource || 'Lead source', sa.byLeadSource));
    if (wantDim('sourceTag', sa.bySourceTag))
      parts.push(renderSheetAttributionTable(L.sourceTag || 'Dashboard source', sa.bySourceTag));
    if (wantDim('campaign', sa.byCampaign))
      parts.push(renderSheetAttributionTable(L.campaign || 'Campaign', sa.byCampaign));
    if (wantDim('adset', sa.byAdset))
      parts.push(renderSheetAttributionTable(L.adset || 'Ad set', sa.byAdset));
    if (wantDim('ad', sa.byAd)) parts.push(renderSheetAttributionTable(L.ad || 'Ad', sa.byAd));
    if (wantDim('product', sa.byProduct))
      parts.push(renderSheetAttributionTable(L.product || 'Product', sa.byProduct));

    var html = parts.filter(Boolean).join('');
    grid.innerHTML =
      html ||
      '<p class="muted">No attribution columns matched the header row. Add columns named Lead Source, Campaign, Adset, Ad, or Product (see README).</p>';
  }

  // ---- Campaigns ----
  function renderCampaigns(data) {
    var c = data.metaCampaigns || [];
    var p = el('campaigns-panel');
    if (!p) return;
    if (c.length === 0) { p.style.display = 'none'; return; }
    p.style.display = '';
    var totSpend = 0, totImpr = 0, totClicks = 0, totLeads = 0;
    var rows = c.map(function(x) {
      totSpend += x.spend; totImpr += (x.impressions||0); totClicks += (x.clicks||0); totLeads += (x.leads||0);
      var cpl = x.leads>0 ? money(x.spend/x.leads) : '--';
      return '<tr><td><strong>'+x.name+'</strong></td><td>'+money(x.spend)+'</td><td>'+(x.impressions||0).toLocaleString()+'</td><td>'+(x.clicks||0).toLocaleString()+'</td><td>'+x.leads+'</td><td>'+cpl+'</td></tr>';
    }).join('');
    var totCpl = totLeads>0 ? money(totSpend/totLeads) : '--';
    rows += '<tr style="border-top:2px solid var(--border);font-weight:700"><td>TOTAL</td><td>'+money(totSpend)+'</td><td>'+totImpr.toLocaleString()+'</td><td>'+totClicks.toLocaleString()+'</td><td>'+totLeads+'</td><td>'+totCpl+'</td></tr>';
    el('campaigns-table').innerHTML = rows;
  }

  // ---- Team ----
  function renderTeamTable(data) {
    el('team-table').innerHTML = (data.team||[]).map(function(t) {
      return '<tr><td><strong>'+t.name+'</strong></td><td>'+t.callsSet+'</td><td>'+t.shows+'</td><td>'+t.offers+'</td><td>'+t.closes+'</td><td>'+(t.shows>0?pct((t.closes/t.shows)*100):'--')+'</td><td>'+money(t.revenue)+'</td></tr>';
    }).join('');
  }

  // ---- Stage Bars ----
  function renderStageBars(data) {
    var max = 1;
    (data.byStage||[]).forEach(function(s){if(s.count>max)max=s.count;});
    var colors = ['#5ea2ff','#85b8ff','#22d68a','#fbbf24','#f59e0b','#10b981','#ff5c7c','#ef4444','#8b9dc3'];
    el('stage-bars').innerHTML = (data.byStage||[]).map(function(s,i) {
      var w = Math.max(3,(s.count/max)*100);
      return '<div class="stage-row"><span class="stage-label">'+s.stage+'</span><div class="stage-bar-track"><div class="stage-bar-fill" style="width:'+w+'%;background:'+(colors[i]||'#5ea2ff')+'">'+s.count+' ('+money(s.value)+')</div></div></div>';
    }).join('');
    var tot = 0; (data.byStage||[]).forEach(function(s){tot+=s.value;});
    el('pipeline-total').innerHTML = 'Total Pipeline Value: ' + money(tot);
  }

  // ---- Actions ----
  function renderActions(data) {
    var sc = data.statusCounts || {}, items = [];
    if (data.showRate < 40 && data.bookedCalls > 0) items.push({icon:'!',cls:'critical',text:'<strong>Show rate is '+pct(data.showRate)+' (target: 50%+).</strong> '+data.bookedCalls+' booked but only '+data.liveCalls+' showed. Confirmation texts 24hr + 1hr before every call.'});
    if ((sc.offered||0) > 0 && (sc.contractSent||0) < (sc.offered||0)) items.push({icon:'>',cls:'warning',text:'<strong>'+sc.offered+' offers, '+sc.contractSent+' contracts sent.</strong> '+(sc.offered-sc.contractSent)+' stalled. Work #nurture-followups daily.'});
    var wonDeals = sc.closedWonDeals != null ? sc.closedWonDeals : sc.closedWon;
    if ((sc.contractSent||0) > (wonDeals||0)) items.push({icon:'>',cls:'warning',text:'<strong>'+sc.contractSent+' contracts out, '+wonDeals+' won (deals in range).</strong> Follow up on outstanding contracts.'});
    if (data.adSpend === 0) items.push({icon:'i',cls:'info',text:'<strong>No ad spend in this date range.</strong> Revenue and ROAS show -- when spend is $0. Check a wider date range or verify Meta connection.'});
    if (data.fetchedAt) items.push({icon:'i',cls:'info',text:'<strong>Live data.</strong> Fetched '+new Date(data.fetchedAt).toLocaleString()+'. '+data.leads+' contacts with status tags in range. '+(data.totalContacts||0).toLocaleString()+' total in GHL.'});
    el('actions').innerHTML = items.map(function(a){return '<li><div class="action-icon '+a.cls+'">'+a.icon+'</div><div class="action-text">'+a.text+'</div></li>';}).join('');
  }

  // ---- RAW DATA TAB ----
  function renderRawData(data) {
    var rows = data.rawData || [];
    el('raw-summary').textContent = rows.length + ' contacts with status tags in ' + data.dateRange + ' range. ' + (data.totalContacts||0).toLocaleString() + ' total in GHL. Showing contacts added within selected date window.';

    renderRawRows(rows);

    el('raw-search').value = '';
    el('raw-search').oninput = function () {
      var q = this.value.toLowerCase();
      var filtered = q ? rows.filter(function (r) {
        return (r.name + r.email + r.source + r.statuses + r.assignedTo + r.allTags).toLowerCase().indexOf(q) !== -1;
      }) : rows;
      renderRawRows(filtered);
    };

    el('raw-export').onclick = function () { exportCSV(rows); };
  }

  function renderRawRows(rows) {
    el('raw-table-body').innerHTML = rows.map(function (r) {
      var d = r.dateAdded ? new Date(r.dateAdded).toLocaleDateString() : '';
      var la = r.lastActivity ? new Date(r.lastActivity).toLocaleDateString() : '';
      return '<tr>' +
        '<td>' + esc(r.name) + '</td>' +
        '<td>' + esc(r.email) + '</td>' +
        '<td>' + esc(r.phone) + '</td>' +
        '<td>' + esc(r.source) + '</td>' +
        '<td>' + esc(r.statuses) + '</td>' +
        '<td>' + esc(r.assignedTo) + '</td>' +
        '<td>' + d + '</td>' +
        '<td>' + la + '</td>' +
        '<td title="' + esc(r.allTags) + '">' + esc(r.allTags) + '</td>' +
      '</tr>';
    }).join('');
  }

  var submissionsCache = { rows: [], kvEnabled: false, redisError: null, fetchError: null };
  var salesStatsCache = null;

  function getRangeMs() {
    var r = el('range-select').value;
    var now = Date.now();
    if (r === 'custom' && el('date-start').value) {
      var start = new Date(el('date-start').value + 'T00:00:00').getTime();
      var end = el('date-end').value ? new Date(el('date-end').value + 'T23:59:59').getTime() : now;
      return { start: start, end: end };
    }
    if (r === 'all') return { start: 0, end: now };
    var days = { '7d': 7, '30d': 30, '90d': 90 }[r] || 30;
    return { start: now - days * 86400000, end: now };
  }

  function rangeQueryForStats() {
    var r = el('range-select').value;
    var q = 'range=' + encodeURIComponent(r);
    if (r === 'custom') {
      var s = el('date-start').value;
      var e = el('date-end').value;
      if (s) q += '&start=' + encodeURIComponent(s);
      if (e) q += '&end=' + encodeURIComponent(e);
    }
    return q;
  }

  function filterSubmissionsRows(rows) {
    var b = getRangeMs();
    return rows.filter(function (row) {
      var t = new Date(row.submittedAt || 0).getTime();
      if (Number.isNaN(t)) return false;
      return t >= b.start && t <= b.end;
    });
  }

  function fetchSubmissionsData() {
    submissionsCache.fetchError = null;
    return fetch('/api/deal-submissions')
      .then(function (res) {
        return res.text().then(function (text) {
          var data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            throw new Error(
              'Submissions API returned non-JSON (HTTP ' + res.status + '). ' + (text || '').slice(0, 160)
            );
          }
          if (!res.ok) {
            throw new Error((data && data.error) || 'HTTP ' + res.status);
          }
          return data;
        });
      })
      .then(function (data) {
        submissionsCache.rows = data.rows || [];
        submissionsCache.kvEnabled = !!data.kvEnabled;
        submissionsCache.redisError = data.redisError || null;
        submissionsCache.fetchError = null;
        renderSubmissionsView();
      })
      .catch(function (err) {
        submissionsCache.rows = [];
        submissionsCache.kvEnabled = false;
        submissionsCache.redisError = null;
        submissionsCache.fetchError = err && err.message ? err.message : String(err);
        renderSubmissionsView();
      });
  }

  function fetchSalesStatsData() {
    var range = el('range-select').value;
    if (range === 'custom' && !el('date-start').value) {
      renderSalesBoardView(null);
      return Promise.resolve();
    }
    return fetch('/api/sales-stats?' + rangeQueryForStats())
      .then(function (res) {
        return res.text().then(function (text) {
          var data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            throw new Error('Sales stats non-JSON (HTTP ' + res.status + '). ' + (text || '').slice(0, 120));
          }
          if (!res.ok) throw new Error((data && data.error) || 'HTTP ' + res.status);
          return data;
        });
      })
      .then(function (data) {
        salesStatsCache = data;
        renderSalesBoardView(data);
      })
      .catch(function (err) {
        salesStatsCache = { fetchError: err && err.message ? err.message : String(err) };
        renderSalesBoardView(null);
      });
  }

  function refreshSalesTabs() {
    fetchSubmissionsData();
    fetchSalesStatsData();
    renderSalesBoardV2();
  }

  function renderSubmissionsView() {
    var banner = el('submissions-kv-banner');
    var meta = el('submissions-meta');
    var tbody = el('submissions-tbody');
    if (!banner || !meta || !tbody) return;

    if (submissionsCache.fetchError) {
      banner.style.display = '';
      banner.className = 'kv-banner kv-banner-err';
      banner.innerHTML =
        '<strong>Could not load submissions.</strong> ' +
        esc(submissionsCache.fetchError) +
        ' Check the browser Network tab for <code>/api/deal-submissions</code>. Redeploy after adding API routes.';
    } else if (submissionsCache.redisError) {
      banner.style.display = '';
      banner.className = 'kv-banner kv-banner-err';
      banner.innerHTML =
        '<strong>Redis returned an error.</strong> Env vars are set but the list read failed: ' +
        esc(submissionsCache.redisError) +
        ' If you use <code>REDIS_URL</code>, confirm Vercel deployed with <code>package.json</code> (ioredis). REST mode needs HTTPS URL + token.';
    } else if (!submissionsCache.kvEnabled) {
      banner.style.display = '';
      banner.className = 'kv-banner kv-banner-warn';
      banner.innerHTML =
        '<strong>Redis not connected.</strong> In Vercel → <strong>Storage</strong> link Redis (you should see <code>REDIS_URL</code>) or add REST vars <code>UPSTASH_REDIS_REST_*</code> / <code>KV_REST_API_*</code>. <strong>Redeploy</strong> after env changes so dependencies install. Submissions only appear for deals logged <em>after</em> Redis works.';
    } else {
      banner.style.display = 'none';
    }

    var filtered = filterSubmissionsRows(submissionsCache.rows);
    var q = (el('submissions-search') && el('submissions-search').value || '').toLowerCase();
    var rows = q
      ? filtered.filter(function (r) { return JSON.stringify(r).toLowerCase().indexOf(q) !== -1; })
      : filtered;

    var totalKv = submissionsCache.rows.length;
    meta.textContent =
      rows.length + ' in range · ' + totalKv + ' total in Redis';
    if (submissionsCache.kvEnabled && !submissionsCache.fetchError && !submissionsCache.redisError) {
      if (totalKv === 0) {
        meta.textContent +=
          ' · List is empty: use the Sales tab to create a deal (nothing is pulled from GHL or Excel).';
      } else if (filtered.length === 0 && totalKv > 0 && !q) {
        meta.textContent +=
          ' · Try All Time or a wider range; filter uses submit time, not closing date.';
      } else if (q && filtered.length > 0 && rows.length === 0) {
        meta.textContent += ' · Search has no matches in this range.';
      }
    }

    function d(v) {
      if (v === null || v === undefined) return '';
      return esc(String(v));
    }

    tbody.innerHTML =
      rows
        .map(function (r) {
          return (
            '<tr>' +
            '<td>' + d(r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '') + '</td>' +
            '<td>' + d(r.fathom1) + '</td>' +
            '<td>' + d(r.fathom2) + '</td>' +
            '<td>' + d(r.dateCreated) + '</td>' +
            '<td>' + d(r.dateFirstCall) + '</td>' +
            '<td>' + d(r.datePayment) + '</td>' +
            '<td>' + d(r.closingDate) + '</td>' +
            '<td>' + d(r.clientOrEvent) + '</td>' +
            '<td>' + d(r.firstName) + '</td>' +
            '<td>' + d(r.lastName) + '</td>' +
            '<td>' + d(r.email) + '</td>' +
            '<td>' + d(r.phone) + '</td>' +
            '<td>' + d(r.product) + '</td>' +
            '<td>' + d(r.monetaryValue) + '</td>' +
            '<td>' + d(r.amountOwed) + '</td>' +
            '<td>' + d(r.setter) + '</td>' +
            '<td>' + d(r.setterPct) + '</td>' +
            '<td>' + d(r.closer) + '</td>' +
            '<td>' + d(r.closerComm) + '</td>' +
            '<td>' + d(r.leadSource) + '</td>' +
            '<td>' + d(r.campaign) + '</td>' +
            '<td>' + d(r.adset) + '</td>' +
            '<td>' + d(r.ad) + '</td>' +
            '<td>' + d(r.sourceTag) + '</td>' +
            '<td>' + d(r.stageName || r.pipelineStageId) + '</td>' +
            '<td>' + (r.paymentPlan ? 'Y' : '') + '</td>' +
            '<td>' + d(r.notes) + '</td>' +
            '<td>' + d(r.contactId) + '</td>' +
            '<td>' + d(r.opportunityId) + '</td>' +
            '</tr>'
          );
        })
        .join('') ||
        '<tr><td colspan="29" class="submissions-empty">' +
        (submissionsCache.kvEnabled && totalKv === 0
          ? '<strong>No rows yet.</strong> Redis is connected but nobody has logged a deal from the <strong>Sales</strong> tab. <strong>All Time</strong> only shows those logs, not past Excel or GHL closes.'
          : q && filtered.length > 0
            ? '<strong>No matches.</strong> Clear the search box or try different keywords.'
            : submissionsCache.kvEnabled && filtered.length === 0 && totalKv > 0
              ? '<strong>None in this date range.</strong> Switch the header to <strong>All Time</strong> or widen dates (filter uses <em>submitted</em> time).'
              : 'No submissions in this range.') +
        '</td></tr>';
  }

  function clearSalesBoardTables() {
    [
      'salesboard-by-product',
      'salesboard-by-stage',
      'salesboard-by-setter',
      'salesboard-by-closer',
      'salesboard-by-sourcetag',
      'salesboard-by-leadsource',
      'salesboard-by-campaign',
      'salesboard-by-adset',
      'salesboard-by-closing-month',
      'salesboard-cw-by-tag',
      'salesboard-cw-by-lead',
      'salesboard-cw-detail'
    ].forEach(function (id) {
      var n = el(id);
      if (n) n.innerHTML = '';
    });
  }

  function renderSalesBoardView(data) {
    var b = el('salesboard-kv-banner');
    if (!b) return;
    if (salesStatsCache && salesStatsCache.fetchError) {
      b.style.display = '';
      b.className = 'kv-banner kv-banner-err';
      b.innerHTML =
        '<strong>Could not load sales board.</strong> ' + esc(salesStatsCache.fetchError);
      el('salesboard-kpis').innerHTML = '';
      clearSalesBoardTables();
      return;
    }
    if (data && data.redisError) {
      b.style.display = '';
      b.className = 'kv-banner kv-banner-err';
      b.innerHTML = '<strong>Redis error.</strong> ' + esc(data.redisError);
      el('salesboard-kpis').innerHTML = '';
      clearSalesBoardTables();
      return;
    }
    if (!data || !data.kvEnabled) {
      b.style.display = '';
      b.className = 'kv-banner kv-banner-warn';
      b.innerHTML =
        '<strong>Redis not connected</strong> or no stats in range. Add <code>REDIS_URL</code> (Vercel Storage) or REST vars; <strong>redeploy</strong> so ioredis installs; then log a deal from the Sales tab.';
      el('salesboard-kpis').innerHTML = '';
      clearSalesBoardTables();
      return;
    }
    b.style.display = 'none';

    function fmtLeadClose(x, labelShort) {
      var o = x || {};
      if (!o.count) {
        return { value: '—', sub: 'Need Closed Won + dates on ' + labelShort };
      }
      return {
        value: String(o.avgDays) + ' d',
        sub: 'median ' + o.medianDays + ' d · ' + o.count + ' deal' + (o.count === 1 ? '' : 's')
      };
    }
    function renderClosedWonAttribution(d) {
      var tagBody = el('salesboard-cw-by-tag');
      var leadBody = el('salesboard-cw-by-lead');
      var detBody = el('salesboard-cw-detail');
      if (!tagBody || !leadBody || !detBody) return;
      var cw = d.closedWonCount || 0;
      if (cw === 0) {
        tagBody.innerHTML =
          '<tr><td colspan="4">No <strong>Closed Won</strong> in this range (or widen to <strong>All Time</strong>).</td></tr>';
        leadBody.innerHTML = '<tr><td colspan="4">—</td></tr>';
        detBody.innerHTML = '<tr><td colspan="11">—</td></tr>';
        return;
      }
      var stcw = d.bySourceTagClosedWon || {};
      var keysTag = Object.keys(stcw).sort();
      tagBody.innerHTML =
        keysTag
          .map(function (k) {
            var x = stcw[k];
            return (
              '<tr><td><strong>' +
              esc(k) +
              '</strong></td><td>' +
              x.count +
              '</td><td>' +
              money(x.paid) +
              '</td><td>' +
              money(x.owed) +
              '</td></tr>'
            );
          })
          .join('') || '<tr><td colspan="4">No source tags on wins</td></tr>';
      var lscw = d.byLeadSourceClosedWon || {};
      var keysLead = Object.keys(lscw).sort();
      leadBody.innerHTML =
        keysLead
          .map(function (k) {
            var x = lscw[k];
            return (
              '<tr><td><strong>' +
              esc(k) +
              '</strong></td><td>' +
              x.count +
              '</td><td>' +
              money(x.paid) +
              '</td><td>' +
              money(x.owed) +
              '</td></tr>'
            );
          })
          .join('') || '<tr><td colspan="4">No lead source text on wins</td></tr>';
      var details = d.closedWonDetails || [];
      detBody.innerHTML =
        details
          .map(function (r) {
            return (
              '<tr><td>' +
              esc(r.clientOrEvent) +
              '</td><td>' +
              money(r.paid) +
              '</td><td>' +
              money(r.owed || 0) +
              '</td><td>' +
              esc(r.closingDate || '—') +
              '</td><td>' +
              esc(r.sourceTag) +
              '</td><td>' +
              esc(r.leadSource) +
              '</td><td>' +
              esc(r.campaign) +
              '</td><td>' +
              esc(r.adset) +
              '</td><td>' +
              esc(r.ad) +
              '</td><td>' +
              esc(r.product) +
              '</td><td class="salesboard-cw-notes">' +
              esc(r.notes || '') +
              '</td></tr>'
            );
          })
          .join('') || '<tr><td colspan="11">—</td></tr>';
    }

    var ltc = fmtLeadClose(data.leadToClose, 'Date created → Closing');
    var ftc = fmtLeadClose(data.firstCallToClose, '1st call → Closing');
    var cards = [
      { label: 'Submissions', value: String(data.count), sub: data.dateRange || '' },
      { label: 'Closed Won', value: String(data.closedWonCount || 0), sub: 'Deals in range' },
      { label: 'Win rate', value: pct(data.winRatePct || 0), sub: 'Closed Won / submissions' },
      { label: 'Total paid', value: money(data.totalPaid || 0), sub: 'Amount paid sum' },
      { label: 'Total owed', value: money(data.totalOwed || 0), sub: 'Amount owed sum' },
      { label: 'Won paid sum', value: money(data.closedWonPaid || 0), sub: 'Paid on Closed Won only' },
      { label: 'Avg paid', value: money(data.avgPaid || 0), sub: 'Per submission' },
      { label: 'Avg won deal', value: money(data.avgWonDeal || 0), sub: 'Paid ÷ Closed Won' },
      { label: 'Payment plans', value: pct(data.paymentPlanPct || 0), sub: String(data.paymentPlanCount || 0) + ' deals' },
      { label: 'Est setter $', value: money(data.setterCommEst || 0), sub: 'Paid × Setter 5% (numeric %)' },
      { label: 'Closer comm sum', value: money(data.closerCommTotal || 0), sub: 'Closer $ column' },
      { label: 'Avg lead → close', value: ltc.value, sub: ltc.sub + ' (Closed Won)' },
      { label: 'Avg call → close', value: ftc.value, sub: ftc.sub + ' (Closed Won)' }
    ];
    el('salesboard-kpis').innerHTML = cards
      .map(function (c) {
        return (
          '<div class="kpi">' +
          '<div class="kpi-label">' +
          esc(c.label) +
          '</div>' +
          '<div class="kpi-value">' +
          c.value +
          '</div>' +
          '<div class="kpi-sub">' +
          esc(c.sub) +
          '</div></div>'
        );
      })
      .join('');

    renderClosedWonAttribution(data);

    var bp = data.byProduct || {};
    el('salesboard-by-product').innerHTML =
      Object.keys(bp)
        .sort()
        .map(function (k) {
          var x = bp[k];
          return (
            '<tr><td><strong>' +
            esc(k) +
            '</strong></td><td>' +
            x.count +
            '</td><td>' +
            money(x.paid) +
            '</td><td>' +
            money(x.owed) +
            '</td></tr>'
          );
        })
        .join('') || '<tr><td colspan="4">No rows in range</td></tr>';

    var bs = data.byStage || {};
    el('salesboard-by-stage').innerHTML =
      Object.keys(bs)
        .sort()
        .map(function (k) {
          var x = bs[k];
          return (
            '<tr><td><strong>' +
            esc(k) +
            '</strong></td><td>' +
            x.count +
            '</td><td>' +
            money(x.paid) +
            '</td></tr>'
          );
        })
        .join('') || '<tr><td colspan="3">No rows in range</td></tr>';

    function renderFourCol(map, tbodyId, emptyCols) {
      var m = map || {};
      var keys = Object.keys(m).sort();
      var html = keys
        .map(function (k) {
          var x = m[k];
          return (
            '<tr><td><strong>' +
            esc(k) +
            '</strong></td><td>' +
            x.count +
            '</td><td>' +
            money(x.paid) +
            '</td><td>' +
            money(x.owed) +
            '</td></tr>'
          );
        })
        .join('');
      el(tbodyId).innerHTML = html || '<tr><td colspan="' + (emptyCols || 4) + '">No rows in range</td></tr>';
    }

    function renderCloserTable() {
      var m = data.byCloser || {};
      var keys = Object.keys(m).sort();
      var html = keys
        .map(function (k) {
          var x = m[k];
          return (
            '<tr><td><strong>' +
            esc(k) +
            '</strong></td><td>' +
            x.count +
            '</td><td>' +
            money(x.paid) +
            '</td><td>' +
            money(x.owed) +
            '</td><td>' +
            money(x.comm || 0) +
            '</td></tr>'
          );
        })
        .join('');
      el('salesboard-by-closer').innerHTML =
        html || '<tr><td colspan="5">No rows in range</td></tr>';
    }

    renderFourCol(data.bySetter, 'salesboard-by-setter', 4);
    renderCloserTable();
    renderFourCol(data.bySourceTag, 'salesboard-by-sourcetag', 4);
    renderFourCol(data.byLeadSource, 'salesboard-by-leadsource', 4);
    renderFourCol(data.byCampaign, 'salesboard-by-campaign', 4);
    renderFourCol(data.byAdset, 'salesboard-by-adset', 4);

    var bcm = data.byClosingMonth || {};
    var months = Object.keys(bcm).sort().reverse();
    el('salesboard-by-closing-month').innerHTML =
      months
        .map(function (k) {
          var x = bcm[k];
          return (
            '<tr><td><strong>' +
            esc(k) +
            '</strong></td><td>' +
            x.count +
            '</td><td>' +
            money(x.paid) +
            '</td><td>' +
            money(x.owed) +
            '</td></tr>'
          );
        })
        .join('') || '<tr><td colspan="4">No Closed Won with closing date in range</td></tr>';
  }

  function exportSubmissionsCSV() {
    var filtered = filterSubmissionsRows(submissionsCache.rows);
    var q = (el('submissions-search') && el('submissions-search').value || '').toLowerCase();
    var rows = q
      ? filtered.filter(function (r) { return JSON.stringify(r).toLowerCase().indexOf(q) !== -1; })
      : filtered;
    var headers = [
      'Submitted',
      'Fathom 1',
      'Fathom 2',
      'Date created',
      '1st call',
      'Payment date',
      'Closing date',
      'EVENT_NAME',
      'First',
      'Last',
      'Email',
      'Phone',
      'Product',
      'Paid',
      'Owed',
      'Setter',
      'Setter 5pct',
      'Closer',
      'Closer comm',
      'Lead source',
      'Campaign',
      'Adset',
      'Ad',
      'Source tag',
      'Stage',
      'Payment plan',
      'Notes',
      'Contact ID',
      'Opp ID'
    ];
    function csvCell(x) {
      var s = x == null ? '' : String(x);
      if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    var lines = [headers.join(',')];
    rows.forEach(function (r) {
      lines.push(
        [
          r.submittedAt,
          r.fathom1,
          r.fathom2,
          r.dateCreated,
          r.dateFirstCall,
          r.datePayment,
          r.closingDate,
          r.clientOrEvent,
          r.firstName,
          r.lastName,
          r.email,
          r.phone,
          r.product,
          r.monetaryValue,
          r.amountOwed,
          r.setter,
          r.setterPct,
          r.closer,
          r.closerComm,
          r.leadSource,
          r.campaign,
          r.adset,
          r.ad,
          r.sourceTag,
          r.stageName || r.pipelineStageId,
          r.paymentPlan ? 'Y' : '',
          r.notes,
          r.contactId,
          r.opportunityId
        ]
          .map(csvCell)
          .join(',')
      );
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'esa-submissions-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  }

  function snapStr(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(round(v, 2));
    return String(v);
  }

  /** Flat KPI rows for Snapshot tab (same idea as scripts/snapshot_dashboard_tab.py). */
  function buildSnapshotRows(data) {
    var sc = data.statusCounts || {};
    var lf = data.leadFormMarketing || {};
    var rm = data.revenueModel || {};
    var rangeParam = el('range-select').value;
    var rows = [];

    function add(label, val, how) {
      rows.push({ label: label, value: val, how: how || '', gap: false });
    }
    function gap() { rows.push({ label: '', value: '', how: '', gap: true }); }

    var ghlContactsHow =
      'GHL REST API · contacts with ESA tags · dateAdded (or createdAt) inside selected range';
    var ghlOppRevHow =
      rm.source === 'google_sheets'
        ? 'Google Sheets API · SHEETS_REVENUE_MODE=replace · rows whose date column falls in range'
        : 'GHL REST API · pipeline opportunities · ' + (rm.attribution || 'Closed Won; sum monetaryValue');
    var metaHow = data.adSource || 'Meta Marketing API (or empty if META_ACCESS_TOKEN / account not set)';

    add('Fetched (UTC)', data.fetchedAt || '', 'Server · when /api/data finished building this JSON');
    add('Dashboard date range', data.dateRange || '', 'Server · computed window from ?range= / ?start= / ?end=');
    add('Range selector', rangeParam, 'This page · header dropdown (sent as API query param)');
    gap();

    add('Revenue ($)', snapStr(data.revenue), ghlOppRevHow);
    add('Ad spend ($)', snapStr(data.adSpend), metaHow);
    add(
      'Upfront ROAS (x)',
      data.upfrontRoas > 0 ? snapStr(data.upfrontRoas) + 'x' : '',
      'Derived · Revenue ÷ Ad spend (same date range)'
    );
    add(
      'Revenue source',
      rm.source || '',
      'API field revenueModel.source · which system owns the revenue number above'
    );
    add(
      'Closed won deals (opp count)',
      snapStr(sc.closedWonDeals),
      rm.source === 'google_sheets'
        ? 'Google Sheets · deal row count in range (when sheet replaces GHL revenue)'
        : 'GHL REST API · opportunities in Closed Won with lastStatusChangeAt in range'
    );
    add('AOV ($)', snapStr(data.aov), 'Derived · Revenue ÷ closed-won deal count');
    add('CPA ($)', snapStr(data.cpa), 'Derived · Ad spend ÷ closed-won deal count');
    gap();

    add('GHL leads (in range)', snapStr(data.leads), ghlContactsHow + ' · counted as leads');
    add('Booked calls', snapStr(data.bookedCalls), ghlContactsHow + ' · status-booked tag');
    add(
      'Lead → book %',
      snapStr(data.leadBookPct) + (data.leadBookPct ? '%' : ''),
      'Derived · booked ÷ leads'
    );
    add('Showed', snapStr(sc.showed), ghlContactsHow + ' · status-showed tag');
    add(
      'Show rate %',
      snapStr(data.showRate) + (data.showRate ? '%' : ''),
      'Derived · showed ÷ booked'
    );
    add('Offers made', snapStr(sc.offered), ghlContactsHow + ' · status-offer-made tag');
    add('Closed won (tags)', snapStr(sc.closedWon), ghlContactsHow + ' · status-closed-won tag (not opp $)');
    add('Meta Results (sum campaigns)', snapStr(data.metaLeads), metaHow + ' · sum of campaign "results" / leads');
    add('Meta impressions', snapStr(data.metaImpressions), metaHow + ' · account insights');
    add('Meta clicks', snapStr(data.metaClicks), metaHow + ' · account insights');
    add('CPL ($)', snapStr(data.cpl), 'Derived · ad spend ÷ GHL leads (in range)');
    add('Cost / booking ($)', snapStr(data.costPerBooking), 'Derived · ad spend ÷ booked calls');
    gap();

    add(
      'SS Lead Form · Meta campaign results',
      snapStr(lf.metaSSLeadFormResults),
      'Meta API · campaigns tagged for SS lead form in dashboard code · results field'
    );
    add(
      'SS Lead Form · GHL cohort count',
      snapStr(lf.total),
      'GHL contacts in range · src-fb-lead-form-ss / Meta lead-form tag rules (api/data.js)'
    );
    add(
      'SS · Booked',
      snapStr(lf.booked),
      'Same SS cohort · subset with status-booked'
    );
    add(
      'Canonical Meta lead form GHL tag',
      lf.canonicalGhlMetaLeadFormTag || '',
      'Constant in api/data.js · used to match Meta lead form to GHL tags'
    );
    gap();

    add(
      'Pipeline value (open opps $)',
      snapStr(data.pipelineValue),
      'GHL REST API · all opps in Brian & Diamond pipeline · sum monetaryValue by stage (current snapshot; not filtered by header date range)'
    );
    add('Contacts in CRM (total)', snapStr(data.totalContacts), 'GHL REST API · full contact sync for this location');
    add('Contacts in date range', snapStr(data.contactsInRange), ghlContactsHow + ' · rows after date filter');

    var sr = data.sheetRevenue || {};
    if (sr.mode && sr.mode !== 'off') {
      gap();
      add('Sheet revenue mode', snapStr(sr.mode), 'Env SHEETS_REVENUE_MODE · server-side toggle');
      add(
        'Sheet revenue total',
        snapStr(sr.totalRevenue),
        'Google Sheets API · service account · spreadsheet in env (see README)'
      );
      if (sr.warning) add('Sheet warning', sr.warning, 'Sheet fetch or parse message · check Vercel env / sheet access');
    }

    var sat = data.sheetAttribution;
    if (sat && sat.rowsInRange) {
      gap();
      add('Sheet attribution · rows in range', snapStr(sat.rowsInRange), 'Google Sheets · paid rows in date window · summed by column headers');
      add('GOOGLE_SHEETS_ATTRIBUTION', snapStr(sr.attributionFromSheet ? 'on' : ''), 'Env · when on, sheet is read even if revenue stays GHL');
      var topC = (sat.byCampaign || [])[0];
      if (topC && topC.key && topC.key !== '(blank)')
        add('Top sheet campaign ($)', topC.key + ' · ' + money(topC.revenue), 'Amount column summed for that campaign value');
    }

    return rows;
  }

  function renderSnapshot(data) {
    var body = el('snapshot-table-body');
    if (!body) return;
    var rows = buildSnapshotRows(data);
    body.innerHTML = rows.map(function (r) {
      if (r.gap) return '<tr class="snapshot-gap"><td colspan="3"></td></tr>';
      return (
        '<tr><td>' +
        esc(r.label) +
        '</td><td>' +
        esc(r.value) +
        '</td><td class="snapshot-how">' +
        esc(r.how) +
        '</td></tr>'
      );
    }).join('');
  }

  function exportCSV(rows) {
    var headers = ['Name','Email','Phone','Source','Source Tag','Statuses','Assigned To','Date Added','Last Activity','All Tags'];
    var csv = headers.join(',') + '\n' + rows.map(function (r) {
      return [r.name,r.email,r.phone,r.source,r.sourceTag,r.statuses,r.assignedTo,r.dateAdded,r.lastActivity,'"'+r.allTags.replace(/"/g,'""')+'"'].join(',');
    }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'esa-raw-data-' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
  }

  // ---- MAIN ----
  function render(data) {
    var ghlBan = el('dashboard-ghl-banner');
    if (ghlBan) {
      if (data.ghlDataWarning) {
        ghlBan.style.display = '';
        ghlBan.className = 'kv-banner kv-banner-warn';
        ghlBan.innerHTML =
          '<strong>GHL data:</strong> ' +
          esc(data.ghlDataWarning) +
          (data.ghlContactsApiError && data.ghlDataWarning !== data.ghlContactsApiError
            ? ' <span style="color:var(--muted);font-size:.86rem">(' + esc(data.ghlContactsApiError) + ')</span>'
            : '');
      } else {
        ghlBan.style.display = 'none';
        ghlBan.textContent = '';
        ghlBan.className = 'kv-banner';
      }
    }
    currentData = data;
    renderKPIs(data);
    var fp = el('ui-build-fingerprint');
    if (fp) {
      var km = el('kpi-main-18');
      var n = km ? km.querySelectorAll('.kpi').length : 0;
      fp.textContent = 'Build ' + ESA_UI_BUILD + ' · ' + n + ' main KPI cards (expect 18)';
      fp.className = 'ui-build-fingerprint' + (n === 18 ? '' : ' ui-build-fingerprint-warn');
    }
    renderBenchmarkTable(data); renderFunnel(data);
    renderSourceTable(data);
    renderClosedWonGhlTable(data);
    renderCampaigns(data); renderSheetAttribution(data); renderTeamTable(data);
    renderStageBars(data); renderActions(data); renderRawData(data);
    try {
      renderSnapshot(data);
    } catch (e) {
      console.error('renderSnapshot', e);
      var sb = el('snapshot-table-body');
      if (sb) sb.innerHTML = '<tr><td colspan="3">Snapshot render error. Hard-refresh the page (Cmd+Shift+R). ' + esc(String(e && e.message ? e.message : e)) + '</td></tr>';
    }
  }

  // ---- Custom date range toggle ----
  el('range-select').addEventListener('change', function () {
    var isCustom = this.value === 'custom';
    el('custom-range').style.display = isCustom ? 'flex' : 'none';
    if (!isCustom) load();
  });

  function fetchData() {
    var preview = /[?&]preview=1(?:&|$)/.test(location.search);
    if (preview) {
      el('status-label').textContent = 'Preview (mock JSON)';
      document.querySelector('.status-dot').classList.add('live');
      return fetch('preview-mock.json')
        .then(function (res) {
          if (!res.ok) throw new Error('preview-mock.json ' + res.status);
          return res.json();
        })
        .catch(function (err) {
          el('status-label').textContent = 'Preview error: ' + err.message;
          return null;
        });
    }

    var range = el('range-select').value;
    var url = '/api/data?range=' + range;

    if (range === 'custom') {
      var s = el('date-start').value;
      var e = el('date-end').value;
      if (!s) { el('status-label').textContent = 'Pick a start date'; return Promise.resolve(null); }
      url += '&start=' + s;
      if (e) url += '&end=' + e;
    }

    el('status-label').textContent = 'Loading...';
    document.querySelector('.status-dot').classList.remove('live');

    return fetch(url)
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (data) {
        el('status-label').textContent = 'Live GHL + Meta';
        document.querySelector('.status-dot').classList.add('live');
        return data;
      })
      .catch(function (err) {
        el('status-label').textContent = 'Error: ' + err.message;
        return null;
      });
  }

  function load() {
    fetchData().then(function (d) {
      if (d) render(d);
    });
    refreshSalesTabs();
  }

  el('refresh-btn').addEventListener('click', load);
  el('date-start').addEventListener('change', function () { if (el('range-select').value === 'custom') load(); });
  el('date-end').addEventListener('change', function () { if (el('range-select').value === 'custom') load(); });

  if (el('submissions-search')) {
    el('submissions-search').addEventListener('input', function () {
      renderSubmissionsView();
    });
  }
  if (el('submissions-export')) {
    el('submissions-export').addEventListener('click', exportSubmissionsCSV);
  }

  if (el('submissions-import-btn')) {
    el('submissions-import-btn').addEventListener('click', function () {
      var fileInput = el('submissions-import-file');
      var secretEl = el('submissions-import-secret');
      var statusEl = el('submissions-import-status');
      if (!statusEl) return;
      statusEl.className = 'submissions-import-status';
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        statusEl.textContent = 'Choose a CSV file first.';
        statusEl.classList.add('err');
        return;
      }
      var secret =
        (secretEl && secretEl.value.trim()) || localStorage.getItem('esa.dealUploadSecret') || '';
      if (!secret) {
        statusEl.textContent = 'Enter the team password (same as Sales tab), or save it with Remember on Sales.';
        statusEl.classList.add('err');
        return;
      }
      statusEl.textContent = 'Importing…';
      var reader = new FileReader();
      reader.onerror = function () {
        statusEl.textContent = 'Could not read file.';
        statusEl.className = 'submissions-import-status err';
      };
      reader.onload = function () {
        fetch('/api/deal-import-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: secret, csv: reader.result })
        })
          .then(function (res) {
            return res.json().then(function (j) {
              return { ok: res.ok, j: j };
            });
          })
          .then(function (r) {
            if (r.ok && r.j.ok) {
              statusEl.className = 'submissions-import-status ok';
              statusEl.textContent = r.j.message || 'Import complete.';
              fileInput.value = '';
              refreshSalesTabs();
            } else {
              statusEl.className = 'submissions-import-status err';
              var msg = (r.j && r.j.error) ? r.j.error : 'Import failed';
              if (r.j && r.j.hint) msg += ' — ' + r.j.hint;
              statusEl.textContent = msg;
            }
          })
          .catch(function (e) {
            statusEl.className = 'submissions-import-status err';
            statusEl.textContent = e.message || 'Network error';
          });
      };
      reader.readAsText(fileInput.files[0], 'UTF-8');
    });
  }

  el('snapshot-copy').addEventListener('click', function () {
    if (!currentData) return;
    var lines = buildSnapshotRows(currentData).filter(function (r) { return !r.gap; });
    var tsv =
      'Metric\tValue\tHow we got it\n' +
      lines.map(function (r) { return r.label + '\t' + r.value + '\t' + r.how; }).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).then(function () {
        el('status-label').textContent = 'Snapshot copied';
        setTimeout(function () { el('status-label').textContent = 'Live GHL + Meta'; }, 2000);
      });
    }
  });

  // ---- SALES BOARD V2 (GHL Opportunities) ----

  var sb2Cache = null;

  function renderSalesBoardV2() {
    fetch('/api/sales-stats-v2?' + rangeQueryForStats())
      .then(function (res) {
        return res.text().then(function (text) {
          var data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            throw new Error('sales-stats-v2 non-JSON (HTTP ' + res.status + '). ' + (text || '').slice(0, 120));
          }
          if (!res.ok) throw new Error((data && data.error) || 'HTTP ' + res.status);
          return data;
        });
      })
      .then(function (data) {
        sb2Cache = data;
        paintSalesBoardV2(data);
      })
      .catch(function (err) {
        sb2Cache = null;
        var kpis = el('sb2-kpis');
        if (kpis) kpis.innerHTML = '<div class="kpi"><div class="kpi-label">Error</div><div class="kpi-value">--</div><div class="kpi-sub">' + esc(err.message || String(err)) + '</div></div>';
      });
  }

  function paintSalesBoardV2(data) {
    if (!data) return;

    // -- All variables --
    var totalTcv = data.totalTCV || data.totalTcv || 0;
    var totalCash = data.totalCash || 0;
    var totalOwed = data.totalOwed || 0;
    var dealCount = data.dealCount || 0;
    var aov = dealCount ? totalTcv / dealCount : 0;
    var collectionRate = totalTcv ? (totalCash / totalTcv) * 100 : 0;
    var winRate = data.winRatePct || 0;
    var ppPct = data.paymentPlanPct || 0;
    var ppCount = data.paymentPlanCount || 0;
    var ltc = data.leadToClose || {};
    var ctc = data.callToClose || {};
    var comm = data.commissions || {};
    var totalSetterComm = comm.totalSetterComm || 0;
    var totalCloserComm = comm.totalCloserComm || 0;
    var totalComm = totalSetterComm + totalCloserComm;
    var avgCommPerDeal = dealCount ? totalComm / dealCount : 0;
    var ref = data.refunds || {};
    var refCount = ref.count || 0;
    var refTCV = ref.totalTCV || 0;
    var refBack = ref.totalRefundedBack || 0;
    var netRevenue = totalTcv - refTCV;

    // -- 18 KPI cards in one grid (3 rows of 6) --
    el('sb2-kpis').innerHTML = [
      { label: 'Total TCV', value: money(totalTcv), sub: 'All deals (won + refunded)' },
      { label: 'Total Cash', value: money(totalCash), sub: 'Cash collected' },
      { label: 'Total Owed', value: money(totalOwed), sub: 'Remaining balance' },
      { label: 'Deal Count', value: String(dealCount), sub: 'Won + refunded deals' },
      { label: 'AOV', value: money(aov), sub: 'Avg order value' },
      { label: 'Collection Rate', value: pct(collectionRate), sub: 'Cash / TCV' },
      { label: 'Win Rate', value: pct(winRate), sub: 'Won / (won + lost + refund)' },
      { label: 'Payment Plans', value: String(ppCount), sub: pct(ppPct) + ' of deals' },
      { label: 'Avg Lead > Close', value: ltc.avgDays != null ? ltc.avgDays + 'd' : '--', sub: ltc.count ? 'Median: ' + ltc.medianDays + 'd (' + ltc.count + ' deals)' : 'No date data' },
      { label: 'Avg Call > Close', value: ctc.avgDays != null ? ctc.avgDays + 'd' : '--', sub: ctc.count ? 'Median: ' + ctc.medianDays + 'd (' + ctc.count + ' deals)' : 'No date data' },
      { label: 'Refunds', value: String(refCount), sub: money(refBack) + ' returned' },
      { label: 'Net Revenue', value: money(netRevenue), sub: 'TCV minus refund TCV' },
      { label: 'Setter Commission', value: money(totalSetterComm), sub: 'Total setter comm' },
      { label: 'Closer Commission', value: money(totalCloserComm), sub: 'Total closer comm' },
      { label: 'Total Commission', value: money(totalComm), sub: 'Setter + Closer' },
      { label: 'Avg Comm / Deal', value: money(avgCommPerDeal), sub: 'Per closed deal' },
      { label: 'Refund TCV', value: money(refTCV), sub: refCount + ' deal' + (refCount !== 1 ? 's' : '') + ' refunded' },
      { label: 'Refund Cash Back', value: money(refBack), sub: 'Total returned to clients' }
    ].map(function (c) { return kpiHTML(c); }).join('');

    // Hide separate commission row
    var commEl = el('sb2-commissions');
    if (commEl) commEl.style.display = 'none';

    // -- Helper: render a breakdown table --
    function breakdownTable(headers, rows, emptyMsg) {
      if (!rows || rows.length === 0) {
        return '<table><thead><tr>' +
          headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody><tr><td colspan="' + headers.length + '">' + (emptyMsg || 'No data') + '</td></tr></tbody></table>';
      }
      return '<table><thead><tr>' +
        headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }).join('') +
        '</tbody></table>';
    }

    // -- By Source --
    var bySource = data.bySource || {};
    var sourceKeys = Object.keys(bySource).sort();
    var sourceRows = sourceKeys.map(function (k) {
      var x = bySource[k];
      return ['<strong>' + esc(k) + '</strong>', String(x.deals || x.count || 0), money(x.tcv || 0), money(x.cash || 0), money(x.owed || 0)];
    });
    el('sb2-source-table').innerHTML = breakdownTable(['Source', 'Deals', 'TCV', 'Cash', 'Owed'], sourceRows, 'No source data in range');

    // -- By Product --
    var byProduct = data.byProduct || {};
    var productKeys = Object.keys(byProduct).sort();
    var productRows = productKeys.map(function (k) {
      var x = byProduct[k];
      return ['<strong>' + esc(k) + '</strong>', String(x.deals || x.count || 0), money(x.tcv || 0), money(x.cash || 0), money(x.owed || 0)];
    });
    el('sb2-product-table').innerHTML = breakdownTable(['Product', 'Deals', 'TCV', 'Cash', 'Owed'], productRows, 'No product data in range');

    // -- By Closer --
    var byCloser = data.byCloser || {};
    var closerKeys = Object.keys(byCloser).sort();
    var closerRows = closerKeys.map(function (k) {
      var x = byCloser[k];
      return ['<strong>' + esc(k) + '</strong>', String(x.deals || x.sets || x.count || 0), money(x.tcv || 0), money(x.cash || 0), money(x.commission || x.comm || 0)];
    });
    el('sb2-closer-table').innerHTML = breakdownTable(['Closer', 'Deals', 'TCV', 'Cash', 'Commission'], closerRows, 'No closer data in range');

    // -- By Setter --
    var bySetter = data.bySetter || {};
    var setterKeys = Object.keys(bySetter).sort();
    var setterRows = setterKeys.map(function (k) {
      var x = bySetter[k];
      return ['<strong>' + esc(k) + '</strong>', String(x.deals || x.sets || x.count || 0), money(x.tcv || 0), money(x.cash || 0), money(x.commission || x.comm || 0)];
    });
    el('sb2-setter-table').innerHTML = breakdownTable(['Setter', 'Deals', 'TCV', 'Cash', 'Commission'], setterRows, 'No setter data in range');

    // -- By Month --
    var byMonth = data.byMonth || {};
    var monthKeys = Object.keys(byMonth).sort().reverse();
    var monthRows = monthKeys.map(function (k) {
      var x = byMonth[k];
      return ['<strong>' + esc(k) + '</strong>', String(x.deals || x.count || 0), money(x.tcv || 0), money(x.cash || 0), money(x.owed || 0)];
    });
    el('sb2-month-table').innerHTML = breakdownTable(['Month', 'Deals', 'TCV', 'Cash', 'Owed'], monthRows, 'No monthly data in range');

    // -- Refund table --
    var refDeals = ref.deals || [];
    var refRows = refDeals.map(function (d) {
      return [
        '<strong>' + esc(d.name) + '</strong>',
        money(d.tcv || 0),
        money(d.refundAmount || 0),
        money(d.netCash || 0),
        esc(d.notes || '')
      ];
    });
    var refEl = el('sb2-refund-table');
    if (refEl) refEl.innerHTML = breakdownTable(['Client', 'Original TCV', 'Refunded', 'Net Cash', 'Notes'], refRows, 'No refunds in range');

    // -- Deals table --
    var deals = data.closedWonDeals || data.deals || [];
    var dealHeaders = ['Close Date', 'Client', 'Product', 'TCV', 'Cash', 'Owed', 'Status', 'Source', 'Setter', 'Closer', 'Setter Comm', 'Closer Comm', 'Fathom', 'Notes'];
    var dealRows = deals.map(function (d) {
      return [
        esc(d.closeDate || ''),
        esc(d.name || d.client || ''),
        esc(d.product || ''),
        money(d.tcv || 0),
        money(d.cashCollected || d.cash || 0),
        money(d.owed || 0),
        esc(d.paymentStatus || d.status || ''),
        esc(d.source || ''),
        esc(d.setter || ''),
        esc(d.closer || ''),
        money(d.setterCommAmt || d.setterComm || 0),
        money(d.closerCommAmt || d.closerComm || 0),
        d.fathomUrl || d.fathom ? '<a href="' + esc(d.fathomUrl || d.fathom) + '" target="_blank" rel="noopener">Link</a>' : '',
        esc(d.notes || '')
      ];
    });
    el('sb2-deals-table').innerHTML = breakdownTable(dealHeaders, dealRows, 'No deals in range');
  }

  // -- CSV export for Sales Board v2 --
  (function () {
    var btn = el('sb2-export-csv');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var cachedDeals = sb2Cache && (sb2Cache.closedWonDeals || sb2Cache.deals) || [];
      if (cachedDeals.length === 0) {
        alert('No deals to export.');
        return;
      }
      var headers = ['Close Date', 'Client', 'Product', 'TCV', 'Cash', 'Owed', 'Status', 'Source', 'Setter', 'Closer', 'Setter Comm', 'Closer Comm', 'Fathom', 'Notes'];
      var csvRows = [headers.join(',')];
      cachedDeals.forEach(function (d) {
        var row = [
          d.closeDate || '',
          d.name || d.client || '',
          d.product || '',
          d.tcv || 0,
          d.cashCollected || d.cash || 0,
          d.owed || 0,
          d.paymentStatus || d.status || '',
          d.source || '',
          d.setter || '',
          d.closer || '',
          d.setterCommAmt || d.setterComm || 0,
          d.closerCommAmt || d.closerComm || 0,
          d.fathomUrl || d.fathom || '',
          d.notes || ''
        ].map(function (v) {
          var s = String(v).replace(/"/g, '""');
          return '"' + s + '"';
        });
        csvRows.push(row.join(','));
      });
      var blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'sales-board-v2-export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  })();

  // ---- Meta Ads Tab ----
  var metaAdsCache = null;
  function renderMetaAdsTab() {
    fetch('/api/meta-ads-report?since=2025-05-01')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        metaAdsCache = data;
        paintMetaAds(data);
      })
      .catch(function (e) {
        var kpis = el('meta-kpis');
        if (kpis) kpis.innerHTML = '<div class="kpi"><div class="kpi-label">Error</div><div class="kpi-value">--</div><div class="kpi-sub">' + esc(e.message) + '</div></div>';
      });
  }

  function paintMetaAds(data) {
    if (!data) return;

    function breakdownTable(headers, rows, emptyMsg) {
      if (!rows || rows.length === 0) {
        return '<table><thead><tr>' + headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody><tr><td colspan="' + headers.length + '">' + (emptyMsg || 'No data') + '</td></tr></tbody></table>';
      }
      return '<table><thead><tr>' + headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    }

    // KPIs
    el('meta-kpis').innerHTML = [
      { label: 'Total Ad Spend', value: money(data.totalSpend), sub: 'Since ' + data.since },
      { label: 'Total Leads', value: (data.totalLeads || 0).toLocaleString(), sub: 'Meta results' },
      { label: 'CPL', value: money(data.cpl), sub: 'Cost per lead' },
      { label: 'Meta Deals Closed', value: String(data.metaDealCount || 0), sub: 'FB Lead Form + VSL' },
      { label: 'Meta Revenue (TCV)', value: money(data.metaTCV), sub: 'From Meta-sourced deals' },
      { label: 'Meta Cash Collected', value: money(data.metaCash), sub: 'Actual cash in' },
      { label: 'ROAS (TCV)', value: (data.overallROAS || 0) + 'x', sub: 'TCV / ad spend' },
      { label: 'ROAS (Cash)', value: (data.cashROAS || 0) + 'x', sub: 'Cash / ad spend' },
      { label: 'CPA', value: money(data.cpa), sub: 'Cost per acquisition' },
      { label: 'Impressions', value: (data.totalImpressions || 0).toLocaleString(), sub: 'Total reach' },
      { label: 'Clicks', value: (data.totalClicks || 0).toLocaleString(), sub: 'Total clicks' },
      { label: 'CTR', value: data.totalImpressions > 0 ? pct(data.totalClicks / data.totalImpressions * 100) : '--', sub: 'Click-through rate' }
    ].map(function (c) { return kpiHTML(c); }).join('');

    // Monthly ROAS table
    var monthly = data.monthlyROAS || [];
    var monthRows = monthly.map(function (m) {
      return [
        '<strong>' + esc(m.month) + '</strong>',
        money(m.spend),
        String(m.leads),
        String(m.deals),
        money(m.tcv),
        money(m.cash),
        '<strong>' + m.roas + 'x</strong>',
        m.cashRoas + 'x'
      ];
    });
    var mEl = el('meta-monthly-table');
    if (mEl) mEl.innerHTML = breakdownTable(['Month', 'Ad Spend', 'Leads', 'Deals Closed', 'TCV', 'Cash', 'ROAS (TCV)', 'ROAS (Cash)'], monthRows, 'No monthly data');

    // Leads by campaign per month (drill-down)
    var campByMonth = data.campaignsByMonth || {};
    var monthSelect = el('meta-month-select');
    var campMonthEl = el('meta-camp-month-table');
    if (monthSelect && campMonthEl) {
      var months = Object.keys(campByMonth).sort().reverse();
      monthSelect.innerHTML = months.map(function (ym) {
        return '<option value="' + ym + '">' + ym + '</option>';
      }).join('');

      function renderCampMonth() {
        var ym = monthSelect.value;
        var camps = campByMonth[ym] || [];
        var totalLeadsMonth = 0;
        camps.forEach(function (c) { totalLeadsMonth += c.leads; });
        var rows = camps.filter(function (c) { return c.leads > 0 || c.spend > 5; }).map(function (c) {
          return [
            '<strong>' + esc(c.name) + '</strong>',
            money(c.spend),
            '<strong>' + String(c.leads) + '</strong>',
            c.leads > 0 ? money(c.spend / c.leads) : '--',
            totalLeadsMonth > 0 ? pct(c.leads / totalLeadsMonth * 100) : '--'
          ];
        });
        campMonthEl.innerHTML = breakdownTable(['Campaign', 'Spend', 'Leads', 'CPL', '% of Month'], rows, 'No data for ' + ym);
      }

      monthSelect.onchange = renderCampMonth;
      if (months.length) renderCampMonth();
    }

    // Campaign table
    var camps = data.campaigns || [];
    var campRows = camps.map(function (c) {
      return [
        '<strong>' + esc(c.name) + '</strong>',
        money(c.spend),
        String(c.leads),
        String(c.clicks),
        money(c.cpl),
        c.leads > 0 && data.totalLeads > 0 ? pct(c.leads / data.totalLeads * 100) : '--'
      ];
    });
    var cEl = el('meta-campaigns-table');
    if (cEl) cEl.innerHTML = breakdownTable(['Campaign', 'Spend', 'Leads', 'Clicks', 'CPL', '% of Leads'], campRows, 'No campaign data');

    // Deals table
    var deals = data.metaDeals || [];
    var dealRows = deals.map(function (d) {
      return [
        esc(d.closeDate),
        '<strong>' + esc(d.name) + '</strong>',
        esc(d.source),
        money(d.tcv),
        money(d.cash),
        d.isRefunded ? '<span style="color:var(--red)">Refunded</span>' : '<span style="color:var(--green)">Active</span>'
      ];
    });
    var dEl = el('meta-deals-table');
    if (dEl) dEl.innerHTML = breakdownTable(['Close Date', 'Client', 'Source', 'TCV', 'Cash', 'Status'], dealRows, 'No Meta-attributed deals');
  }

  load();
})();
