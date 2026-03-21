(function () {
  'use strict';

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
      el('tab-sales').style.display = tab === 'sales' ? '' : 'none';
      if (tab === 'sales') initLogDealForm();
      if (tab === 'submissions' || tab === 'salesboard') refreshSalesTabs();
      if (tab === 'snapshot' && currentData) renderSnapshot(currentData);
    });
  });

  var DEAL_STAGE_CLOSED_WON = '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254';
  var logDealOptsLoaded = false;
  var logDealSubmitBound = false;

  function initLogDealForm() {
    var saved = localStorage.getItem('esa.dealUploadSecret');
    if (saved) el('deal-secret').value = saved;

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
          notes: el('deal-notes').value.trim()
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
              statusEl.textContent = r.j.message + ' Contact: ' + (r.j.contactId || '') + ' · Opp: ' + (r.j.opportunityId || '(see GHL)');
              el('deal-form').reset();
              el('deal-product').selectedIndex = 0;
              el('deal-product-custom').value = '';
              el('deal-payment-plan').checked = false;
              el('deal-stage').value = DEAL_STAGE_CLOSED_WON;
              el('deal-source').value = 'src-organic';
              if (el('deal-remember-secret').checked && secret) el('deal-secret').value = secret;
              refreshSalesTabs();
            } else {
              statusEl.className = 'deal-status err';
              statusEl.textContent = (r.j && r.j.error) ? r.j.error : ('HTTP ' + r.status);
              if (r.j && r.j.hint) statusEl.textContent += ' — ' + r.j.hint;
              if (r.j && r.j.ghl && r.j.ghl.message) statusEl.textContent += ' · ' + r.j.ghl.message;
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

  // ---- SS Lead Form · Marketing QA (top row) ----
  function renderLeadFormKPIs(data) {
    var lf = data.leadFormMarketing || {};
    var total = lf.total || 0;
    var booked = lf.booked || 0;
    var diamond = lf.bookedByDiamond || 0;
    var unbookedGhl = lf.unbooked != null ? lf.unbooked : Math.max(0, total - booked);
    var selfN = lf.selfBookTagged || 0;
    var metaR = lf.metaSSLeadFormResults || 0;
    var metaSp = lf.metaSSLeadFormSpend || 0;
    var metaCpr = metaR > 0 && metaSp > 0 ? money(metaSp / metaR) + ' / result' : '—';
    var useMeta = metaR > 0;
    var primaryCount = useMeta ? metaR : total;
    var unbookedVsMeta = useMeta ? Math.max(0, metaR - booked) : unbookedGhl;
    var bookPctOfSs = useMeta && metaR ? (booked / metaR) * 100 : (total ? lf.bookRatePct || 0 : 0);
    var sub1 = useMeta
      ? (money(metaSp) + ' spend · ~' + metaCpr + ' · GHL SS tag: ' + total + (total > metaR ? ' (trim workflows if extra)' : ''))
      : ('GHL (Meta lead form tags or src-fb-lead-form-ss): ' + total + ' · connect Meta to show Ads Manager count');
    var cards = [
      { label: 'SS Lead forms (Meta)', value: primaryCount.toLocaleString(), sub: '“SS | Lead Form” campaigns = source of truth for volume. ' + sub1, marketing: true },
      { label: 'Lead forms booked', value: booked.toLocaleString(), sub: useMeta ? pct(bookPctOfSs) + ' of Meta’s ' + metaR + ' SS results' + (selfN ? ' · ' + selfN + ' self-book tag' : '') : (total ? pct(lf.bookRatePct || 0) + ' of GHL SS' : '—'), marketing: true },
      { label: 'Booked by Diamond', value: diamond.toLocaleString(), sub: booked ? pct(lf.diamondShareOfBookedPct || 0) + ' of booked' : '—', marketing: true },
      { label: 'Unbooked (vs Meta SS)', value: unbookedVsMeta.toLocaleString(), sub: useMeta ? 'Meta ' + metaR + ' − CRM SS booked (approx. queue)' + (booked > metaR ? ' · CRM booked > Meta: check duplicate tags' : '') : 'GHL SS tag − booked (no Meta match)', marketing: true }
    ];
    var wrap = el('kpi-lead-forms');
    if (!wrap) return;
    wrap.innerHTML = cards.map(kpiHTML).join('');
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
    var bottomCards = [
      { label: 'Closed Won', value: sc.closedWonDeals != null ? sc.closedWonDeals : sc.closedWon, sub: money(data.revenue) + ' · ' + revSrc + sheetWarn, delta: null },
      { label: 'Closed Lost', value: sc.closedLost || 0, sub: 'Dead deals', delta: null },
      { label: 'No Show', value: sc.noShow || 0, sub: 'Calendar no-show / cancelled', delta: null },
      { label: 'Ad Spend', value: data.adSpend > 0 ? money(data.adSpend) : '--', sub: (data.adSource || 'No data') + (data.metaImpressions ? ' | ' + data.metaImpressions.toLocaleString() + ' impr' : ''), delta: null },
      { label: 'CPL', value: data.cpl > 0 ? money(data.cpl) : '--', sub: 'Cost per lead', delta: data.cpl > 0 ? benchmarkDelta('cpl', data.cpl, true) : null },
      { label: 'Cost / Booking', value: data.costPerBooking > 0 ? money(data.costPerBooking) : '--', sub: 'Cost per booked call', delta: data.costPerBooking > 0 ? benchmarkDelta('costPerBooking', data.costPerBooking, true) : null },
      { label: 'Upfront ROAS', value: data.upfrontRoas > 0 ? data.upfrontRoas + 'x' : '--', sub: 'Revenue / spend', delta: data.upfrontRoas > 0 ? benchmarkDelta('upfrontRoas', data.upfrontRoas) : null }
    ];
    el('kpi-top').innerHTML = topCards.map(kpiHTML).join('');
    el('kpi-bottom').innerHTML = bottomCards.map(kpiHTML).join('');
  }

  function kpiHTML(c) {
    var d = c.delta ? ' <span class="kpi-delta ' + c.delta.dir + '">' + c.delta.text + '</span>' : '';
    var mk = c.marketing ? ' kpi-marketing' : '';
    return '<div class="kpi' + mk + '"><div class="kpi-label">' + c.label + '</div><div class="kpi-value">' + c.value + '</div><div class="kpi-sub">' + c.sub + d + '</div></div>';
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

  function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

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
        ' Fix URL/token in Vercel (use the <strong>REST</strong> URL and full token, not <code>redis://</code>).';
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

    meta.textContent =
      rows.length + ' in range · ' + submissionsCache.rows.length + ' total in KV';

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
        .join('') || '<tr><td colspan="28">No submissions in this range.</td></tr>';
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
      el('salesboard-by-product').innerHTML = '';
      el('salesboard-by-stage').innerHTML = '';
      return;
    }
    if (data && data.redisError) {
      b.style.display = '';
      b.className = 'kv-banner kv-banner-err';
      b.innerHTML = '<strong>Redis error.</strong> ' + esc(data.redisError);
      el('salesboard-kpis').innerHTML = '';
      el('salesboard-by-product').innerHTML = '';
      el('salesboard-by-stage').innerHTML = '';
      return;
    }
    if (!data || !data.kvEnabled) {
      b.style.display = '';
      b.className = 'kv-banner kv-banner-warn';
      b.innerHTML =
        '<strong>Redis not connected</strong> or no stats in range. Connect Upstash Redis (or KV env vars), redeploy, then log a deal from the Sales tab.';
      el('salesboard-kpis').innerHTML = '';
      el('salesboard-by-product').innerHTML = '';
      el('salesboard-by-stage').innerHTML = '';
      return;
    }
    b.style.display = 'none';

    var cards = [
      { label: 'Submissions', value: String(data.count), sub: data.dateRange || '' },
      { label: 'Total paid', value: money(data.totalPaid || 0), sub: 'Amount paid sum' },
      { label: 'Total owed', value: money(data.totalOwed || 0), sub: 'Amount owed sum' },
      { label: 'Avg paid', value: money(data.avgPaid || 0), sub: 'Per submission' },
      { label: 'Payment plans', value: pct(data.paymentPlanPct || 0), sub: String(data.paymentPlanCount || 0) + ' deals' }
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
    renderLeadFormKPIs(data);
    currentData = data;
    renderKPIs(data); renderBenchmarkTable(data); renderFunnel(data);
    renderSourceTable(data); renderCampaigns(data); renderTeamTable(data);
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

  load();
})();
