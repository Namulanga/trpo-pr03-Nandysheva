let rows = [];
let notifications = [];
let onlyDone = false;

const metricsRow = document.getElementById('metricsRow');
const rowsBody = document.getElementById('rowsBody');
const rowsCounter = document.getElementById('rowsCounter');
const dataError = document.getElementById('dataError');

const METRIC_STYLE = {
  'Пользователи': 'primary',
  'Заявки': 'info',
  'Ошибки': 'danger',
  'Готовность': 'success'
};
const STATUS_STYLE = {
  'Новая': 'text-bg-secondary',
  'В работе': 'text-bg-primary',
  'Готово': 'text-bg-success'
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить ${path} (код ${response.status})`);
  }
  return response.json();
}

async function init() {
  try {
    const [dashboard, notes] = await Promise.all([
      loadJson('dataset/dashboard.json'),
      loadJson('dataset/notifications.json')
    ]);
    notifications = notes;
    rows = dashboard.rows;
    renderMetrics(dashboard.metrics);
    renderTable();
  } catch (error) {
    dataError.textContent = `${error.message}. Откройте страницу через локальный сервер и проверьте папку data.`;
    dataError.classList.remove('d-none');
    renderTable();
  }
}

function renderMetrics(metrics) {
  metricsRow.replaceChildren();
  metrics.forEach((metric) => {
    const style = METRIC_STYLE[metric.title] || 'secondary';
    const col = el('div', 'col-12 col-sm-6 col-xl-3');
    const card = el('div', `card shadow-sm h-100 metric-card metric-card--${style}`);
    const body = el('div', 'card-body');
    body.append(
      el('div', 'text-secondary', metric.title),
      el('div', 'metric-card__value', String(metric.value))
    );
    card.append(body);
    col.append(card);
    metricsRow.append(col);
  });
}

function renderTable() {
  rowsBody.replaceChildren();
  const visible = onlyDone ? rows.filter((row) => row.status === 'Готово') : rows;

  if (visible.length === 0) {
    const tr = el('tr');
    const td = el('td', 'text-center text-secondary py-4', 'Нет данных для отображения');
    td.colSpan = 3;
    tr.append(td);
    rowsBody.append(tr);
  }

  visible.forEach((row) => {
    const tr = el('tr');
    const statusCell = el('td');
    statusCell.append(el('span', `badge ${STATUS_STYLE[row.status] || 'text-bg-light'}`, row.status));
    tr.append(el('th', null, String(row.id)), el('td', null, row.action), statusCell);
    tr.firstChild.scope = 'row';
    rowsBody.append(tr);
  });

  rowsCounter.textContent = visible.length;
}

init();