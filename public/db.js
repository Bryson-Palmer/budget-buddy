let db;

// Create a new db request for a `budget` database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
    // Create object store `pending` and set autoIncrement to true
    const db = e.target.result;

    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = (e) => {
    db = e.target.result;
    
    // Check to see if app is online before reading from the database
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = (e) => {
    console.log("Houston, we have a problem.", e.target.errorCode);
};

function saveRecord(record) {
    // Create a transaction in the pending database with read/write access
    const transaction = db.transaction(["pending"], "readwrite");

    // Access the pending object store
    const store = transaction.objectStore("pending");

    // Add record to the store with add method
    store.add(record);
}

function checkDatabase() {
    // Open a transaction in your pending database
    const transaction = db.transaction(["pending"], "readwrite");

    // Access the pending object store
    const store = transaction.objectStore("pending");

    // Get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        // If there is anything in the store, make fetch post
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                // If successful, open a transaction in the pending db
                const transaction = db.transaction(["pending"], "readwrite");

                // Access the pending object store
                const store = transaction.objectStore("pending");

                // Clear all items in the store
                store.clear();
            });
        }
    }
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);