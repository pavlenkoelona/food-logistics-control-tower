let state;

const formatNumber = value => new Intl.NumberFormat('de-DE').format(value);

async function init() {
  state = await fetch('data/logistics.json').then(response => {
    if (!response.ok) throw new Error('Data could not be loaded');
    return response.json();
  });
  renderAll();
  bindEvents();
}

function renderAll() {
  document.querySelector('#kpis').innerHTML = state.kpis.map(kpi => `
    <article class="kpi-card">
      <div class="kpi-top"><span>${kpi.label}</span><span class="kpi-icon">${kpi.icon}</span></div>
      <strong>${kpi.value}</strong><span class="trend ${kpi.alert ? 'alert' : ''}">${kpi.trend}</span>
    </article>`).join('');

  document.querySelector('#flowTrack').innerHTML = state.flow.map(step => `
    <article class="flow-step"><span>${step.label}</span><strong>${step.value}</strong><small>${step.detail}</small></article>`).join('');

  document.querySelector('#alertCount').textContent = `${state.alerts.length} open`;
  document.querySelector('#alerts').innerHTML = state.alerts.map((alert, index) => `
    <div class="alert-row"><i class="alert-dot ${alert.severity}"></i><div><strong>${alert.title}</strong><small>${alert.detail}</small></div><button data-alert="${index}">Review</button></div>`).join('');

  renderProduction();
  renderWarehouse();
  renderBatches();
  renderTraceOptions();
}

function renderProduction() {
  const selected = document.querySelector('#lineFilter').value;
  const rows = state.production.filter(order => selected === 'all' || order.line === selected);
  document.querySelector('#productionList').innerHTML = rows.map(order => `
    <div class="production-row"><div><strong>${order.meal}</strong><small>${order.order} · ${order.line}</small></div><div><strong>${formatNumber(order.portions)}</strong><small>portions</small></div><div><div class="bar"><i class="${order.readiness < 90 ? 'low' : ''}" style="width:${order.readiness}%"></i></div><small>${order.readiness}% materials ready</small></div><span class="status-pill ${order.readiness < 90 ? 'risk' : ''}">${order.readiness < 90 ? 'AT RISK' : 'READY'}</span></div>`).join('');
}

function renderWarehouse() {
  document.querySelector('#warehouseMap').innerHTML = state.zones.map(zone => `
    <article class="zone ${zone.state === 'normal' ? '' : zone.state}">
      <div class="zone-head"><div><span class="eyebrow">${zone.code}</span><h3>${zone.name}</h3></div><span class="temperature">${zone.temperature}</span></div>
      <div class="racks">${[72,55,88,64,90,76,48,82].map(fill => `<i class="rack" style="--fill:${Math.min(fill,zone.capacity)}%"></i>`).join('')}</div>
      <div class="zone-footer"><span>${zone.capacity}% capacity</span><span>${zone.state.toUpperCase()}</span></div>
    </article>`).join('');
}

function renderBatches(query = '') {
  const term = query.toLowerCase();
  const rows = state.batches.filter(batch => `${batch.batch} ${batch.material}`.toLowerCase().includes(term));
  document.querySelector('#batchTable').innerHTML = rows.map(batch => `
    <tr><td class="priority">#${batch.priority}</td><td>${batch.batch}</td><td><strong>${batch.material}</strong></td><td>${batch.zone}</td><td>${batch.quantity}</td><td>${batch.expires}</td><td><button class="row-action" data-trace="${batch.batch}">Trace →</button></td></tr>`).join('');
}

function renderTraceOptions() {
  document.querySelector('#traceSelect').innerHTML = state.batches.map(batch => `<option value="${batch.batch}">${batch.batch} · ${batch.material}</option>`).join('');
  traceBatch(state.batches[0].batch);
}

function traceBatch(batchId) {
  const batch = state.batches.find(item => item.batch === batchId);
  if (!batch) return;
  document.querySelector('#traceSelect').value = batchId;
  document.querySelector('#traceResult').innerHTML = `
    <div class="panel-heading"><div><p class="eyebrow">Trace complete</p><h2>${batch.batch}</h2></div><span class="status-pill">IMPACT KNOWN</span></div>
    <div class="trace-path">
      <article class="trace-node"><span>Supplier</span><strong>${batch.supplier}</strong><small>Received ${batch.received}</small></article>
      <article class="trace-node"><span>Warehouse batch</span><strong>${batch.material}</strong><small>${batch.quantity} · ${batch.zone}</small></article>
      <article class="trace-node"><span>Production</span><strong>${batch.productionOrder}</strong><small>${batch.meal}</small></article>
      <article class="trace-node"><span>Distribution status</span><strong>Not released</strong><small>Recall containment possible</small></article>
    </div>
    <div class="trace-summary"><strong>Recall decision support</strong><p>One production order and one finished-meal family are affected. The batch is still inside the controlled internal flow, so distribution can be blocked before release.</p></div>`;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message; toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function bindEvents() {
  document.querySelectorAll('.nav-button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.nav-button,.view').forEach(item => item.classList.remove('active'));
    button.classList.add('active'); document.querySelector(`#${button.dataset.view}`).classList.add('active');
  }));
  document.querySelector('#themeButton').addEventListener('click', () => document.documentElement.classList.toggle('dark'));
  document.querySelector('#lineFilter').addEventListener('change', renderProduction);
  document.querySelector('#batchSearch').addEventListener('input', event => renderBatches(event.target.value));
  document.querySelector('#traceButton').addEventListener('click', () => traceBatch(document.querySelector('#traceSelect').value));
  document.addEventListener('click', event => {
    if (event.target.dataset.trace) {
      document.querySelector('[data-view="traceability"]').click(); traceBatch(event.target.dataset.trace);
    }
    if (event.target.dataset.alert) showToast('Exception opened in the review queue');
  });
  document.querySelector('#simulateButton').addEventListener('click', () => {
    state.flow[0].value += 1; state.flow[1].value += 2; renderAll(); bindEvents();
    showToast('Inbound truck simulated · 2 batches moved to quality inspection');
  }, {once:true});
}

init().catch(error => {
  document.body.innerHTML = `<main><h1>Unable to load dashboard</h1><p>${error.message}. Run the included local server instead of opening index.html directly.</p></main>`;
});

