const STORAGE_KEY = 'standalone_calculator_history_v1';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const MAX_ITEMS = 100;
const operators = ['+', '-', '×', '÷'];

let expression = '';
let result = '0';
let justCalculated = false;
let lastProcess = '';
let installPrompt = null;

const expressionEl = document.querySelector('#expression');
const resultEl = document.querySelector('#result');
const historyEl = document.querySelector('#history');
const toastEl = document.querySelector('#toast');

function cleanHistory() {
  const now = Date.now();
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const fresh = Array.isArray(value) ? value.filter(item => item && now - Number(item.createdAt) < MAX_AGE) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh.slice(0, MAX_ITEMS)));
    return fresh.slice(0, MAX_ITEMS);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function evaluate(formula) {
  let safe = formula.replaceAll('×', '*').replaceAll('÷', '/');
  while (/[+\-*/.]$/.test(safe)) safe = safe.slice(0, -1);
  if (!safe || !/^-?[0-9+\-*/.\s]+$/.test(safe)) return null;
  try {
    const value = Function(`"use strict"; return (${safe})`)();
    if (!Number.isFinite(value)) return null;
    return String(Math.round((value + Number.EPSILON) * 1e10) / 1e10);
  } catch { return null; }
}

function updateScreen() {
  expressionEl.textContent = lastProcess || expression || '準備開始計算';
  resultEl.textContent = justCalculated ? result : (expression || '0');
}

function save(formula, answer) {
  const history = cleanHistory().filter(item => !(item.formula === formula && item.answer === answer));
  history.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, formula, answer, createdAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)));
  renderHistory();
}

function calculate() {
  const answer = evaluate(expression);
  if (answer === null) return showToast('算式不完整');
  const formula = expression;
  result = answer;
  lastProcess = `${formula} =`;
  justCalculated = true;
  save(formula, answer);
  updateScreen();
}

function input(value) {
  if (operators.includes(value)) {
    if (!expression && value !== '-') return;
    if (justCalculated) expression = result;
    if (operators.includes(expression.slice(-1))) expression = expression.slice(0, -1);
    expression += value;
    justCalculated = false;
    lastProcess = '';
  } else {
    if (justCalculated) expression = '';
    const segment = expression.split(/[+\-×÷]/).pop();
    if (value === '.' && segment.includes('.')) return;
    expression += value;
    justCalculated = false;
    lastProcess = '';
  }
  updateScreen();
}

function renderHistory() {
  const history = cleanHistory();
  historyEl.replaceChildren();
  if (!history.length) {
    const empty = document.createElement('div');
    empty.className = 'empty'; empty.textContent = '完成一次計算後，紀錄會出現在這裡';
    historyEl.append(empty); return;
  }
  history.forEach(item => {
    const row = document.createElement('article'); row.className = 'item';
    const formula = document.createElement('div'); formula.className = 'formula'; formula.textContent = item.formula;
    const answer = document.createElement('div'); answer.className = 'answer'; answer.textContent = `= ${item.answer}`;
    const copy = document.createElement('button'); copy.textContent = '複製全部'; copy.addEventListener('click', () => copyText(`${item.formula} = ${item.answer}`, '過程與結果已複製'));
    row.append(formula, answer, copy); historyEl.append(row);
  });
}

async function copyText(text, message) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.append(area); area.select(); document.execCommand('copy'); area.remove();
    }
    showToast(message);
  } catch { showToast('無法複製，請再試一次'); }
}

let toastTimer;
function showToast(message) {
  toastEl.textContent = message; toastEl.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
}

document.querySelector('.keys').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  const { value, action } = button.dataset;
  if (value) input(value);
  if (action === 'equals') calculate();
  if (action === 'clear') { expression = ''; result = '0'; lastProcess = ''; justCalculated = false; updateScreen(); }
  if (action === 'back') { if (justCalculated) { expression = ''; justCalculated = false; lastProcess = ''; } else expression = expression.slice(0, -1); updateScreen(); }
  if (action === 'percent') { const valueNow = evaluate(expression); if (valueNow !== null) { expression = String(Number(valueNow) / 100); justCalculated = false; lastProcess = ''; updateScreen(); } }
});

document.querySelector('#copy-process').addEventListener('click', () => copyText(lastProcess ? lastProcess.slice(0, -2) : (expression || '0'), '計算過程已複製'));
document.querySelector('#copy-result').addEventListener('click', () => copyText(justCalculated ? result : (evaluate(expression) || expression || '0'), '計算結果已複製'));

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; document.querySelector('#install').hidden = false; });
document.querySelector('#install').addEventListener('click', async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; document.querySelector('#install').hidden = true; });
window.addEventListener('appinstalled', () => showToast('App 已安裝'));

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
cleanHistory(); renderHistory(); updateScreen();
