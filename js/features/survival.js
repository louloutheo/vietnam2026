import { state } from '../state.js';
import { saveChecklist } from '../storage.js';
const MEDICAL_PHRASES = [
  { label: '👨‍⚕️ Médecin !', text: 'Tôi cần bác sĩ', medical: true },
  { label: '🏥 Hôpital ?', text: 'Bệnh viện ở đâu?', medical: true },
  { label: '🤧 Allergie !', text: 'Tôi bị dị ứng', medical: true },
  { label: '💊 Pharmacie', text: 'Hiệu thuốc', medical: true }
];
const DAILY_PHRASES = [
  { label: '👋 Bonjour', text: 'Xin chào' },
  { label: '🙏 Merci', text: 'Cảm ơn' },
  { label: '💸 Trop cher', text: 'Đắt quá' },
  { label: '🌶️ Sans piment', text: 'Không cay nhé' },
  { label: '🚽 Toilettes ?', text: 'Nhà vệ sinh ở đâu?' }
];
export function initSurvival() { bindSurvivalEvents(); renderChecklist(); renderSpeakButtons(); }
function bindSurvivalEvents() { document.getElementById('btn-add-check')?.addEventListener('click', addChecklistItem); document.getElementById('btn-translate-speak')?.addEventListener('click', translateAndSpeak); }
function renderSpeakButtons() {
  document.getElementById('medical-speak-grid').innerHTML = MEDICAL_PHRASES.map((p) => `<button class="speak-btn speak-btn-medical" data-speak="${p.text}">${p.label}</button>`).join('');
  document.getElementById('daily-speak-grid').innerHTML = DAILY_PHRASES.map((p) => `<button class="speak-btn" data-speak="${p.text}">${p.label}</button>`).join('');
  document.querySelectorAll('[data-speak]').forEach((button) => button.addEventListener('click', () => speakVN(button.dataset.speak)));
}
function renderChecklist() {
  const container = document.getElementById('checklist-container');
  container.innerHTML = state.checklist.map((item, index) => {
    const checkedStyle = item.c ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text);';
    return `<div class="info-line expense-line"><div style="display:flex;align-items:center;gap:12px;"><input type="checkbox" ${item.c ? 'checked' : ''} data-check-index="${index}" style="transform:scale(1.3);accent-color:var(--primary);"><span style="${checkedStyle} font-size:14px;font-weight:bold;">${item.t}</span></div><button class="expense-delete-btn" data-delete-check="${index}">✕</button></div>`;
  }).join('');
  container.querySelectorAll('[data-check-index]').forEach((checkbox) => checkbox.addEventListener('change', () => toggleChecklistItem(Number(checkbox.dataset.checkIndex))));
  container.querySelectorAll('[data-delete-check]').forEach((button) => button.addEventListener('click', () => deleteChecklistItem(Number(button.dataset.deleteCheck))));
}
function addChecklistItem() { const input = document.getElementById('check-input'); const value = input?.value?.trim(); if (!value) return; state.checklist.push({ t: value, c: false }); saveChecklist(); renderChecklist(); input.value = ''; }
function toggleChecklistItem(index) { state.checklist[index].c = !state.checklist[index].c; saveChecklist(); renderChecklist(); }
function deleteChecklistItem(index) { state.checklist.splice(index, 1); saveChecklist(); renderChecklist(); }
function speakVN(text) { const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'vi-VN'; speechSynthesis.speak(utterance); }
async function translateAndSpeak() { const input = document.getElementById('trans-input'); const result = document.getElementById('trans-result'); const text = input?.value?.trim(); if (!text || !result) return; result.textContent = '⏳ Traduction...'; try { const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|vi`); const data = await response.json(); const translated = data?.responseData?.translatedText || 'Traduction indisponible'; result.textContent = `« ${translated} »`; speakVN(translated); } catch { result.textContent = '❌ Pas de réseau'; } }
