/**
 * survie.js — Module Survie & Outils
 */

const CHECK_KEY = 'vn_checklist_v2';

let checklist = JSON.parse(localStorage.getItem(CHECK_KEY)) || [
    { text: 'Passeports & Visas', done: false },
    { text: 'Permis de conduire international', done: false },
    { text: 'Répulsif moustiques (DEET 50%)', done: false },
    { text: 'Assurance voyage', done: false },
    { text: 'Adaptateur électrique', done: false },
];

export function initSurvie() {
    renderSurvie();
}

function renderSurvie() {
    const container = document.getElementById('survie-content');
    if (!container) return;

    container.innerHTML = `
        <h2 class="win-title">🧳 Outils & Survie</h2>

        <div class="card">
            <div class="card-title">🤝 Règles d'or Locales</div>
            <div style="font-size:13px; color:var(--text-muted); line-height:1.7; font-weight:500;">
                <div style="margin-bottom:6px;"><b style="color:var(--text);">🚦 Traverser :</b> Avance lentement et <b>sans t'arrêter ni reculer</b>. Les motos te contournent.</div>
                <div style="margin-bottom:6px;"><b style="color:var(--text);">💰 Négocier :</b> Divise par 2 ou 3, souris toujours.</div>
                <div><b style="color:var(--text);">💵 Pourboire :</b> Non requis, 10k–20k ₫ très apprécié.</div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">✅ Check-list Départ</div>
            <div class="add-form-row" style="margin-bottom:12px;">
                <input type="text" id="check-input" class="input-field" placeholder="Ajouter un item...">
                <button class="btn-pill" id="btn-add-check" style="padding:10px 14px;">+</button>
            </div>
            <div id="checklist-container"></div>
        </div>

        <div class="card">
            <div class="card-title">🗣️ Survie Audio</div>

            <div class="section-label">🚨 Urgences Médicales</div>
            <div class="btn-grid">
                <button class="speak-btn danger" data-vn="Tôi cần bác sĩ">👨‍⚕️ Médecin !</button>
                <button class="speak-btn danger" data-vn="Bệnh viện ở đâu?">🏥 Hôpital ?</button>
                <button class="speak-btn danger" data-vn="Tôi bị dị ứng">🤧 Allergie !</button>
                <button class="speak-btn danger" data-vn="Hiệu thuốc ở đâu?">💊 Pharmacie</button>
            </div>

            <div class="section-label">💬 Quotidien</div>
            <div class="btn-grid">
                <button class="speak-btn" data-vn="Xin chào">👋 Bonjour</button>
                <button class="speak-btn" data-vn="Cảm ơn">🙏 Merci</button>
                <button class="speak-btn" data-vn="Đắt quá">💸 Trop cher</button>
                <button class="speak-btn" data-vn="Không cay nhé">🌶️ Sans piment</button>
                <button class="speak-btn" data-vn="Nhà vệ sinh ở đâu?">🚽 Toilettes ?</button>
                <button class="speak-btn" data-vn="Cho tôi xem thực đơn">📋 Menu</button>
            </div>

            <div class="section-label">🌐 Traducteur (réseau requis)</div>
            <div class="trans-row">
                <input type="text" id="trans-input" class="input-field" placeholder="Taper une phrase en français...">
                <button class="btn-pill" id="btn-translate" style="background:var(--accent); color:white; padding:0 14px;">🔊</button>
            </div>
            <div class="trans-result" id="trans-result"></div>
        </div>
    `;

    renderChecklist();
    bindSurvieEvents();
}

function renderChecklist() {
    const container = document.getElementById('checklist-container');
    if (!container) return;
    container.innerHTML = checklist.map((item, i) => `
        <div class="check-item">
            <input type="checkbox" id="chk-${i}" ${item.done ? 'checked' : ''} data-i="${i}">
            <label for="chk-${i}" class="check-label ${item.done ? 'done' : ''}">${item.text}</label>
            <button class="btn-delete" data-del-check="${i}">✕</button>
        </div>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            checklist[parseInt(cb.dataset.i)].done = cb.checked;
            saveChecklist();
            renderChecklist();
        });
    });

    container.querySelectorAll('[data-del-check]').forEach(btn => {
        btn.addEventListener('click', () => {
            checklist.splice(parseInt(btn.dataset.delCheck), 1);
            saveChecklist();
            renderChecklist();
        });
    });
}

function saveChecklist() {
    localStorage.setItem(CHECK_KEY, JSON.stringify(checklist));
}

function bindSurvieEvents() {
    // Ajout check
    document.getElementById('btn-add-check')?.addEventListener('click', () => {
        const val = document.getElementById('check-input').value.trim();
        if (val) {
            checklist.push({ text: val, done: false });
            saveChecklist();
            document.getElementById('check-input').value = '';
            renderChecklist();
        }
    });

    // Soundboard
    document.querySelectorAll('[data-vn]').forEach(btn => {
        btn.addEventListener('click', () => speakVN(btn.dataset.vn));
    });

    // Traducteur
    document.getElementById('btn-translate')?.addEventListener('click', translateAndSpeak);
}

function speakVN(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel(); // Annuler la parole en cours
    window.speechSynthesis.speak(utterance);
}

async function translateAndSpeak() {
    const input = document.getElementById('trans-input')?.value?.trim();
    if (!input) return;

    const result = document.getElementById('trans-result');
    if (result) result.textContent = '⏳ Traduction...';

    try {
        const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=fr|vi`
        );
        const data = await res.json();
        const translated = data.responseData.translatedText;
        if (result) result.textContent = `« ${translated} »`;
        speakVN(translated);
    } catch {
        if (result) result.textContent = '❌ Pas de réseau';
    }
}
