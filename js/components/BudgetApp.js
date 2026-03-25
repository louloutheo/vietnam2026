export class BudgetApp {
    constructor(database) {
        this.db = database;
        this.initEvents();
        this.loadData();
    }

    initEvents() {
        // Délégation d'événements : on écoute sur le body pour éviter les problèmes de DOM
        document.body.addEventListener('click', async (e) => {
            if (e.target && e.target.id === 'add-expense-btn') {
                e.preventDefault();
                await this.handleAddExpense();
            }
        });

        document.body.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && e.target && e.target.id === 'expense-amount') {
                e.preventDefault();
                await this.handleAddExpense();
            }
        });
    }

    async handleAddExpense() {
        const amountInput = document.getElementById('expense-amount');
        const descInput = document.getElementById('expense-desc');

        if (!amountInput || !descInput) return;

        const amount = parseFloat(amountInput.value);
        const desc = descInput.value.trim() || "Dépense";

        if (isNaN(amount) || amount <= 0) {
            alert("Veuillez entrer une somme supérieure à 0 !");
            return;
        }

        try {
            await this.db.addExpense(amount, desc);
            amountInput.value = '';
            descInput.value = '';
            amountInput.focus();
            this.loadData();
        } catch (error) {
            console.error("Erreur de sauvegarde", error);
        }
    }

    async loadData() {
        try {
            const expenses = await this.db.getAllExpenses();
            const list = document.getElementById('expense-list');
            const totalDisplay = document.getElementById('total-budget');

            if (!list || !totalDisplay) return;

            list.innerHTML = '';
            let total = 0;

            expenses.reverse().forEach(exp => {
                total += exp.amount;
                const li = document.createElement('li');
                li.className = 'expense-item';
                li.innerHTML = `
                    <span class="exp-desc">${exp.description}</span>
                    <span class="exp-amount">${exp.amount.toFixed(2)} €</span>
                `;
                list.appendChild(li);
            });

            totalDisplay.innerText = `${total.toFixed(2)} €`;
        } catch (error) {
            console.error("Erreur de chargement", error);
        }
    }
}