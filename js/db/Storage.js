export class Database {
    constructor() {
        this.dbName = 'OS_Ultimate_DB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("Erreur IndexedDB", event);
                reject(event);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('expenses')) {
                    db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async addExpense(amount, description) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['expenses'], 'readwrite');
            const store = transaction.objectStore('expenses');
            const request = store.add({ 
                amount: parseFloat(amount), 
                description: description, 
                date: new Date().toISOString() 
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllExpenses() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['expenses'], 'readonly');
            const store = transaction.objectStore('expenses');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}