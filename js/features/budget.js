import { state } from "../state.js";
import { saveExpenses, saveExchangeRate } from "../storage.js";

export function initBudget() {
  bindBudgetEvents();
  renderBudget();
  updateExchangeRateUI();
  fetchExchangeRate();
}

function bindBudgetEvents() {
  document.getElementById("btn-add-expense")?.addEventListener("click", addExpense);
  document.getElementById("conv-eur")?.addEventListener("input", convertEurToVnd);
  document.getElementById("conv-vnd")?.addEventListener("input", convertVndToEur);
  document.getElementById("grab-km")?.addEventListener("input", calcGrab);
}

export function renderBudget() {
  const budgetSpentElem = document.getElementById("budget-spent");
  const expenseListElem = document.getElementById("expense-list");
  let total = 0;
  let html = "";
  state.expenses.forEach((expense, index) => {
    total += parseFloat(expense.aE);
    html += `<div class="info-line expense-line"><span class="expense-main"><span class="budget-tag">${expense.ville}</span>${expense.d}</span><strong>${expense.a} ${expense.c}</strong><button class="expense-delete-btn" data-expense-index="${index}">✕</button></div>`;
  });
  if (budgetSpentElem) budgetSpentElem.textContent = `${total.toFixed(2)} €`;
  if (expenseListElem) {
    expenseListElem.innerHTML = html;
    expenseListElem.querySelectorAll(".expense-delete-btn").forEach((btn)=>btn.addEventListener("click",()=>deleteExpense(Number(btn.dataset.expenseIndex))));
  }
}

function addExpense() {
  const amount = document.getElementById("exp-amount")?.value?.trim();
  const desc = document.getElementById("exp-desc")?.value?.trim() || "Dépense";
  const currency = document.getElementById("exp-currency")?.value || "VND";
  if (!amount) return;
  const amountNumber = parseFloat(amount);
  if (Number.isNaN(amountNumber)) return;
  const eurEquivalent = currency === "VND" ? (amountNumber / state.exchangeRate).toFixed(2) : amountNumber.toFixed(2);
  const currentCity = state.trip[state.currentDayIdx]?.ville?.split("->")[0]?.trim() || "Voyage";
  state.expenses.unshift({ d: desc, a: amountNumber, c: currency, aE: eurEquivalent, ville: currentCity });
  saveExpenses();
  renderBudget();
  document.getElementById("exp-amount").value = "";
  document.getElementById("exp-desc").value = "";
}

function deleteExpense(index){state.expenses.splice(index,1);saveExpenses();renderBudget()}
function convertEurToVnd(){const eur=parseFloat(document.getElementById("conv-eur")?.value)||0; const vndInput=document.getElementById("conv-vnd"); if(vndInput) vndInput.value=Math.round(eur*state.exchangeRate);}
function convertVndToEur(){const vnd=parseFloat(document.getElementById("conv-vnd")?.value)||0; const eurInput=document.getElementById("conv-eur"); if(eurInput) eurInput.value=(vnd/state.exchangeRate).toFixed(2);}
function calcGrab(){const km=parseFloat(document.getElementById("grab-km")?.value)||0; const resultEl=document.getElementById("grab-result"); if(!resultEl)return; resultEl.textContent=km>0?`~ ${Math.round(20000+km*15000).toLocaleString("fr-FR")} ₫`:"0 ₫";}
function updateExchangeRateUI(live=false){const rateEl=document.getElementById("rate-display"); if(rateEl) rateEl.textContent=`1 € = ${state.exchangeRate.toLocaleString("fr-FR")} ₫ ${live?"(En direct)":"(Local / cache)"}`;}
async function fetchExchangeRate(){try{const r=await fetch("https://api.exchangerate-api.com/v4/latest/EUR"); const d=await r.json(); if(d?.rates?.VND){state.exchangeRate=d.rates.VND; saveExchangeRate(); updateExchangeRateUI(true);}}catch{updateExchangeRateUI(false);}}
