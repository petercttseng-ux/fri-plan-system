// =====================================================
// 水試所科技計畫資訊系統 - app.js
// =====================================================

let currentYear = '114';
let selectedPlanIds = new Set();
let chartInstances = {};

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  renderPlanSelector('114');
});

function setCurrentDate() {
  const now = new Date();
  const rocYear = now.getFullYear() - 1911;
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const el = document.getElementById('current-date');
  if (el) el.textContent = `中華民國 ${rocYear} 年 ${m} 月 ${d} 日`;
}

// ---- Year Switch ----
function switchYear(year) {
  currentYear = year;
  selectedPlanIds.clear();

  document.getElementById('tab-114').classList.toggle('active', year === '114');
  document.getElementById('tab-115').classList.toggle('active', year === '115');

  renderPlanSelector(year);
  clearResults();
}

// ---- Plan Selector ----
function renderPlanSelector(year) {
  const plans = PLANS_DATA[year] || [];
  const grid = document.getElementById('plan-select-grid');
  grid.innerHTML = '';
  plans.forEach(p => {
    const item = document.createElement('label');
    item.className = 'plan-checkbox-item';
    item.dataset.id = p.id;
    item.innerHTML = `
      <input type="checkbox" value="${p.id}" onchange="togglePlan('${p.id}', this.checked)">
      <div>
        <div class="plan-label-text">${p.name}</div>
        <div class="plan-label-unit">📍 ${p.unit} ｜ 👤 ${p.pi}</div>
      </div>`;
    grid.appendChild(item);
  });
}

function togglePlan(id, checked) {
  if (checked) selectedPlanIds.add(id);
  else selectedPlanIds.delete(id);

  // Update visual state
  document.querySelectorAll('.plan-checkbox-item').forEach(el => {
    const cb = el.querySelector('input[type="checkbox"]');
    el.classList.toggle('selected', cb.checked);
  });

  renderResults();
}

function selectAllPlans() {
  const plans = PLANS_DATA[currentYear] || [];
  selectedPlanIds.clear();
  plans.forEach(p => selectedPlanIds.add(p.id));
  document.querySelectorAll('.plan-checkbox-item input[type="checkbox"]').forEach(cb => {
    cb.checked = true;
    cb.closest('.plan-checkbox-item').classList.add('selected');
  });
  renderResults();
}

function clearSelection() {
  selectedPlanIds.clear();
  document.querySelectorAll('.plan-checkbox-item input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.plan-checkbox-item').classList.remove('selected');
  });
  clearResults();
}

// ---- Render Results ----
function clearResults() {
  document.getElementById('results-area').innerHTML = '';
  document.getElementById('stats-bar').style.display = 'none';
  document.getElementById('empty-state').style.display = '';
  chartInstances = {};
}

function renderResults() {
  const plans = (PLANS_DATA[currentYear] || []).filter(p => selectedPlanIds.has(p.id));
  const resultsArea = document.getElementById('results-area');
  const statsBar = document.getElementById('stats-bar');
  const emptyState = document.getElementById('empty-state');

  // Destroy old charts
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e){} });
  chartInstances = {};
  resultsArea.innerHTML = '';

  if (plans.length === 0) {
    statsBar.style.display = 'none';
    emptyState.style.display = '';
    return;
  }

  emptyState.style.display = 'none';
  statsBar.style.display = 'flex';

  // Stats
  const totalBudget = plans.reduce((sum, p) => {
    const nums = p.budget.replace(/,/g, '').match(/\d+/);
    return sum + (nums ? parseInt(nums[0]) : 0);
  }, 0);
  document.getElementById('stat-count').textContent = plans.length;
  document.getElementById('stat-budget').textContent = totalBudget.toLocaleString();
  document.getElementById('stat-year').textContent = currentYear === '114' ? '114年度' : '115年度';

  // Cards
  plans.forEach((plan, idx) => {
    const card = buildPlanCard(plan, idx + 1, currentYear);
    resultsArea.appendChild(card);
  });

  // Render charts after DOM insert
  setTimeout(() => {
    plans.forEach(plan => {
      (plan.charts || []).forEach((chartDef, ci) => {
        const canvasId = `chart-${plan.id}-${ci}`;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const instance = new Chart(ctx, {
          type: chartDef.type,
          data: {
            labels: chartDef.labels,
            datasets: [{
              label: chartDef.title,
              data: chartDef.values,
              backgroundColor: chartDef.type === 'bar'
                ? chartDef.values.map((_, i) => hexToRgba(chartDef.color, 0.75 - i * 0.05))
                : hexToRgba(chartDef.color, 0.15),
              borderColor: chartDef.color,
              borderWidth: chartDef.type === 'bar' ? 0 : 2.5,
              borderRadius: chartDef.type === 'bar' ? 6 : 0,
              fill: chartDef.type === 'line',
              tension: 0.4,
              pointBackgroundColor: chartDef.color,
              pointRadius: 5,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => ` ${ctx.formattedValue}`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 11, family: 'Noto Sans TC' }, color: '#64748b' }
              },
              y: {
                grid: { color: 'rgba(0,0,0,0.06)' },
                ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8' }
              }
            }
          }
        });
        chartInstances[canvasId] = instance;
      });
    });
  }, 80);
}

function buildPlanCard(plan, seq, year) {
  const card = document.createElement('div');
  card.className = 'plan-card';
  card.id = `plan-card-${plan.id}`;

  const isY115 = year === '115';
  const headerClass = isY115 ? 'card-header y115' : 'card-header';
  const badgeClass = isY115 ? 'plan-year-badge badge-115' : 'plan-year-badge badge-114';
  const badgeText = isY115 ? '115年度（2026）' : '114年度（2025）';
  const secTitleClass = isY115 ? 'section-title-text green' : 'section-title-text';

  // Work items HTML
  const workHTML = Array.isArray(plan.workItems)
    ? `<ul class="work-list">${plan.workItems.map(w => `<li>${w}</li>`).join('')}</ul>`
    : `<div style="font-size:14px;color:#64748b;line-height:1.8;">${plan.workItems || '詳見計畫書'}</div>`;

  // Results section (only 114)
  const resultSection = plan.results ? `
    <div class="info-section">
      <div class="section-header">
        <div class="section-icon icon-result">🏆</div>
        <div class="section-title-text gold">重要研究成果</div>
      </div>
      <div class="section-body result-body">${plan.results}</div>
    </div>` : '';

  // Charts HTML
  const chartsHTML = (plan.charts || []).length > 0 ? `
    <div class="info-section">
      <div class="section-header">
        <div class="section-icon icon-chart">📊</div>
        <div class="section-title-text purple">研究成果圖表</div>
      </div>
      <div class="charts-grid">
        ${(plan.charts || []).map((c, ci) => `
          <div class="chart-wrapper">
            <div class="chart-title">${c.title}</div>
            <canvas id="chart-${plan.id}-${ci}" class="chart-canvas"></canvas>
          </div>`).join('')}
      </div>
    </div>` : '';

  card.innerHTML = `
    <div class="${headerClass}">
      <div class="card-header-top">
        <span class="plan-seq-badge">計畫 ${seq}</span>
        <span class="${badgeClass}">${badgeText}</span>
      </div>
      <div class="plan-title">${plan.name}</div>
      <div class="plan-meta-row">
        <div class="meta-chip">🏢 <span>${plan.unit}</span></div>
        <div class="meta-chip">👤 主持人：<strong>${plan.pi}</strong></div>
        <div class="meta-chip">💰 <strong>${plan.budget}</strong></div>
        <div class="meta-chip">📅 ${plan.period}</div>
      </div>
    </div>
    <div class="card-body">
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon icon-goal">🎯</div>
          <div class="${secTitleClass}">計畫主要目標</div>
        </div>
        <div class="section-body goal-body">${plan.goal}</div>
      </div>
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon icon-work">🔧</div>
          <div class="section-title-text green">主要工作項目及實施方法</div>
        </div>
        <div class="section-body work-body">${workHTML}</div>
      </div>
      ${resultSection}
      ${chartsHTML}
    </div>`;

  return card;
}

// ---- Print ----
function printReport() {
  if (selectedPlanIds.size === 0) {
    alert('請先選擇計畫後再列印。');
    return;
  }
  window.print();
}

// ---- Save PDF ----
function savePDF() {
  if (selectedPlanIds.size === 0) {
    alert('請先選擇計畫後再儲存PDF。');
    return;
  }
  const overlay = document.getElementById('pdf-overlay');
  overlay.classList.add('active');

  const rocYear = new Date().getFullYear() - 1911;
  const now = new Date();
  const dateStr = `${rocYear}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const yearLabel = currentYear === '114' ? '114年度' : '115年度';
  const filename = `水試所科技計畫_${yearLabel}_${dateStr}.pdf`;

  // Build print element
  const printDiv = document.createElement('div');
  printDiv.style.cssText = 'position:fixed;top:-99999px;left:0;width:210mm;';

  // Cover page
  printDiv.innerHTML = `
    <div style="text-align:center;padding:60px 40px;background:linear-gradient(135deg,#0a2740,#0e4d7a);color:white;min-height:160px;margin-bottom:32px;border-radius:12px;">
      <div style="font-size:32px;margin-bottom:12px;">🐟</div>
      <div style="font-size:22px;font-weight:900;letter-spacing:2px;margin-bottom:8px;">農業部水產試驗所</div>
      <div style="font-size:18px;font-weight:700;margin-bottom:8px;">${yearLabel}（${currentYear==='114'?'2025':'2026'}年）科技計畫彙整</div>
      <div style="font-size:12px;opacity:0.7;margin-top:12px;">Taiwan Fisheries Research Institute · Technology Plan Report</div>
      <div style="font-size:12px;opacity:0.7;margin-top:4px;">產生日期：${rocYear}年${now.getMonth()+1}月${now.getDate()}日</div>
    </div>`;

  // Cards content (clone)
  const resultsClone = document.getElementById('results-area').cloneNode(true);
  // Remove canvas (charts don't clone well), replace with placeholder
  resultsClone.querySelectorAll('canvas').forEach(cv => {
    const img = document.createElement('div');
    img.style.cssText = 'padding:10px;color:#64748b;font-size:12px;text-align:center;border:1px dashed #cbd5e1;border-radius:6px;margin-top:8px;';
    img.textContent = '【圖表請參閱線上系統】';
    cv.parentNode.replaceChild(img, cv);
  });
  printDiv.appendChild(resultsClone);
  document.body.appendChild(printDiv);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(printDiv).save().then(() => {
    document.body.removeChild(printDiv);
    overlay.classList.remove('active');
  }).catch(err => {
    console.error('PDF error:', err);
    document.body.removeChild(printDiv);
    overlay.classList.remove('active');
    alert('PDF產生失敗，請改用列印功能（Ctrl+P）選擇儲存為PDF。');
  });
}

// ---- Helper ----
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
