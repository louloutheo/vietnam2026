// js/components/BudgetApp.js
export class BudgetApp {
    constructor(database) {
        this.db = database;
        
        // Ciblage des éléments du DOM
        this.totalDisplay = document.getElementById('total-budget');
        this.amountInput = document.getElementById('expense-amount');
        this.descInput = document.getElementById('expense-desc');
        this.addBtn = document.getElementById('add-expense-btn');
        this.expenseList = document.getElementById('expense-list');

        this.initEvents();
        this.loadData();
    }

    initEvents() {
        this.addBtn.addEventListener('click', async () => {
            const amount = this.amountInput.value;
            const desc = this.descInput.value;

            if (!amount || amount <= 0) return alert("Mets un vrai montant !");

            // Sauvegarde dans la base de données
            await this.db.addExpense(amount, desc || "Dépense");
            
            // Reset des inputs et rechargement
            this.amountInput.value = '';
            this.descInput.value = '';
            this.loadData();
        });
    }

    async loadData() {
        const expenses = await this.db.getAllExpenses();
        this.expenseList.innerHTML = ''; // On vide la liste
        let total = 0;

        // On trie pour avoir les plus récents en haut
        expenses.reverse().forEach(exp => {
            total += exp.amount;
            
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.innerHTML = `
                <span class="exp-desc">${exp.description}</span>
                <span class="exp-amount">${exp.amount.toFixed(2)} €</span>
            `;
            this.expenseList.appendChild(li);
        });

        // Mise à jour du gros compteur
        this.totalDisplay.innerText = `${total.toFixed(2)} €`;
    }
}