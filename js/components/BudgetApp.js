export class BudgetApp {
    constructor(database) {
        this.db = database;
        this.initEvents();
        this.loadData();
    }

    initEvents() {
        // La Délégation d'événements : on écoute les clics sur toute la page
        document.addEventListener('click', async (e) => {
            // Si l'élément cliqué a l'ID de ton bouton Valider
            if (e.target && e.target.id === 'add-expense-btn') {
                await this.handleAddExpense();
            }
        });

        // Bonus : Valider en appuyant sur la touche "Entrée" du clavier
        document.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && document.activeElement.id === 'expense-amount') {
                await this.handleAddExpense();
            }
        });
    }

    async handleAddExpense() {
        // On récupère les valeurs à l'instant T
        const amountInput = document.getElementById('expense-amount');
        const descInput = document.getElementById('expense-desc');
        
        const amount = parseFloat(amountInput.value);
        const desc = descInput.value || "Dépense";

        // Sécurité : on vérifie que c'est bien un nombre positif
        if (isNaN(amount) || amount <= 0) {
            alert("Veuillez entrer une somme valide !");
            return; // On arrête tout
        }

        // 1. Sauvegarde dans la base de données (IndexedDB)
        await this.db.addExpense(amount, desc);
        
        // 2. On vide les cases pour la prochaine dépense
        amountInput.value = '';
        descInput.value = '';
        amountInput.focus(); // Repositionne le curseur dans la case
        
        // 3. On met à jour l'affichage dynamique
        this.loadData();
    }

    async loadData() {
        // On récupère tout depuis la base de données
        const expenses = await this.db.getAllExpenses();
        
        const list = document.getElementById('expense-list');
        const totalDisplay = document.getElementById('total-budget');
        
        if (!list || !totalDisplay) return;

        list.innerHTML = ''; // On vide la liste visuelle
        let total = 0;

        // On affiche les plus récentes en haut
        expenses.reverse().forEach(exp => {
            total += exp.amount; // On additionne au total
            
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.innerHTML = `
                <span class="exp-desc">${exp.description}</span>
                <span class="exp-amount">${exp.amount.toFixed(2)} €</span>
            `;
            list.appendChild(li);
        });

        // On affiche le gros total en haut
        totalDisplay.innerText = `${total.toFixed(2)} €`;
    }
}