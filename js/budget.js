/**
 * budget.js — Module Budget
 */

const EXP_KEY  = 'vn_expenses_v2';
const RATE_KEY = 'vn_rate_v2';

let exchangeRate = parseFloat(localStorage.getItem(RATE_KEY)) || 27500;
let expenses = JSON.parse(localStorage.getItem(EXP_KEY)) || [];

export function initBudget() {
    renderBudget();
    fetchRate();
}

function fetchRate() {
    fetch('https://api.exchangerate-api.com/v4/latest/EUR')
        .then(r => r.json())
        .then(d => {
            exchangeRate = d.rates.VND;
            localStorage.setItem(RATE_KEY, exchangeRate);
            document.getElementById('rate-display')?.textContent &&
                (document.getElementById('rate-display').textContent = `1 € = ${exchangeRate.toLocaleString('fr-FR')} ₫ (live)`);
        })
        .catch(() => {
            const el = document.getElementById('rate-display');
            if (el) el.textContent = `1 € = ${exchangeRate.toLocaleString('fr-FR')} ₫ (hors-ligne)`;
        });
}

function renderBudget() {
    const container = document.getElementById('budget-content');
    if (!container) return;

    const total = expenses.reduce((s, e) => s + parseFloat(e.eurEq), 0);

    container.innerHTML = `
        <h2 class="win-title">💸 Portefeuille</h2>

        <div class="budget-total">
            <div class="budget-amount" id="budget-spent">${total.toFixed(2)} €</div>
            <div class="budget-subtitle">Total dépensé</div>
        </div>

        <div class="card">
            <div class="card-title">📝 Ajouter une dépense</div>
            <div class="add-form-row">
                <input type="number" id="exp-amount" class="input-field" placeholder="Montant" style="width:45%;">
                <select id="exp-currency" class="input-select">
                    <option value="VND">₫ VND</option>
                    <option value="EUR">€ EUR</option>
                </select>
            </div>
            <div class="add-form-row">
                <input type="text" id="exp-desc" class="input-field" placeholder="Quoi ? (Phở, Grab, Hôtel...)">
                <button class="btn-pill" id="btn-add-exp">Valider</button>
            </div>
        </div>

        <div class="tool-grid">
            <div class="tool-card">
                <div class="tool-card-title">💱 Taux Live</div>
                <div style="font-size:10px; color:var(--text-muted); margin-bottom:8px; font-weight:700;" id="rate-display">Calcul...</div>
                <div class="conv-row"><span class="conv-symbol">€</span><input type="number" id="conv-eur" class="input-field" placeholder="Euro"></div>
                <div class="conv-row"><span class="conv-symbol">₫</span><input type="number" id="conv-vnd" class="input-field" placeholder="VND"></div>
            </div>
            <div class="tool-card">
                <div class="tool-card-title">🚕 Grab</div>
                <div style="font-size:10px; margin-bottom:8px;">
                    <a href="grab://" style="color:var(--primary); font-weight:800; text-decoration:none; background:var(--primary-dim); padding:3px 8px; border-radius:8px;">Ouvrir app ↗</a>
                </div>
                <div class="conv-row"><span class="conv-symbol">km</span><input type="number" id="grab-km" class="input-field" placeholder="Distance"></div>
                <div style="font-weight:900; color:var(--primary); font-size:16px; text-align:center; margin-top:10px;" id="grab-result">0 ₫</div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">🚨 Mémo Billets VND</div>
            <div class="vnd-bill" style="background:#38bdf8;">
                <span>500.000 ₫</span><span id="bill-500k">~18,50 €</span>
            </div>
            <div class="vnd-bill" style="background:#f472b6;">
                <span>200.000 ₫</span><span id="bill-200k">~7,40 €</span>
            </div>
            <div class="vnd-bill" style="background:#4ade80; color:#000;">
                <span>100.000 ₫</span><span id="bill-100k">~3,70 €</span>
            </div>
            <div class="vnd-bill" style="background:#f59e0b;">
                <span>50.000 ₫</span><span id="bill-50k">~1,85 €</span>
            </div>
            <div class="vnd-bill" style="background:#38bdf8; outline: 3px dashed red; outline-offset:-3px;">
                <span>20.000 ₫ ⚠️ (≠ 500k !)</span><span id="bill-20k">~0,75 €</span>
            </div>
            <div class="vnd-bill" style="background:#facc15; color:#000;">
                <span>10.000 ₫</span><span id="bill-10k">~0,37 €</span>
            </div>
        </div>

        <div style="font-size:12px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:0.8px; margin: 16px 0 8px;">Dépenses récentes</div>
        <div id="expense-list"></div>
    `;

    renderExpenses();
    bindBudgetEvents();
    updateBillValues();
    fetchRate(); // Re-fetch au cas où
}

function updateBillValues() {
    const bills = { '500k': 500000, '200k': 200000, '100k': 100000, '50k': 50000, '20k': 20000, '10k': 10000 };
    Object.entries(bills).forEach(([key, vnd]) => {
        const el = document.getElementById(`bill-${key}`);
        if (el) el.textContent = `~${(vnd / exchangeRate).toFixed(2)} €`;
    });
}

function renderExpenses() {
    const list = document.getElementById('expense-list');
    if (!list) return;
    if (expenses.length === 0) {
        list.innerHTML = '<div style="color:var(--text-muted); font-size:13px; text-align:center; padding:16px;">Aucune dépense</div>';
        return;
    }
    list.innerHTML = expenses.map((e, i) => `
        <div class="expense-item">
            <span class="expense-tag">${e.ville}</span>
            <span style="flex:1; font-size:13px; color:var(--text);">${e.desc}</span>
            <span class="expense-amount">${e.amount} ${e.currency}</span>
            <button class="btn-delete" data-exp="${i}">✕</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-exp]').forEach(btn => {
        btn.addEventListener('click', () => {
            expenses.splice(parseInt(btn.dataset.exp), 1);
            localStorage.setItem(EXP_KEY, JSON.stringify(expenses));
            renderBudget();
        });
    });
}

function bindBudgetEvents() {
    document.getElementById('btn-add-exp')?.addEventListener('click', () => {
        const amount   = document.getElementById('exp-amount').value;
        const desc     = document.getElementById('exp-desc').value || 'Dépense';
        const currency = document.getElementById('exp-currency').value;
        if (!amount) return;
        const eurEq = currency === 'VND' ? (parseFloat(amount) / exchangeRate).toFixed(2) : amount;
        expenses.unshift({ amount, currency, eurEq, desc, ville: 'Vietnam' });
        localStorage.setItem(EXP_KEY, JSON.stringify(expenses));
        document.getElementById('exp-amount').value = '';
        document.getElementById('exp-desc').value = '';
        renderBudget();
    });

    document.getElementById('conv-eur')?.addEventListener('input', (e) => {
        const vnd = document.getElementById('conv-vnd');
        if (vnd) vnd.value = Math.round(parseFloat(e.target.value || 0) * exchangeRate);
    });

    document.getElementById('conv-vnd')?.addEventListener('input', (e) => {
        const eur = document.getElementById('conv-eur');
        if (eur) eur.value = (parseFloat(e.target.value || 0) / exchangeRate).toFixed(2);
    });

    document.getElementById('grab-km')?.addEventListener('input', (e) => {
        const km = parseFloat(e.target.value) || 0;
        const price = km > 0 ? Math.round(20000 + km * 15000) : 0;
        const el = document.getElementById('grab-result');
        if (el) el.textContent = price > 0 ? `~${price.toLocaleString('fr-FR')} ₫` : '0 ₫';
    });
}
