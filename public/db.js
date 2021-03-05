let db;

// Create a new db request for a `budget` database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(e) {
    // Create object store `pending` and set autoIncrement to true
    const db = e.target.result;

    db.createObjectStore("pending", { autoIncrement: true });

    console.log("Object store 'pending' created.");
};

request.onsuccess = function(e) {
    db = e.target.result;
    
    // Check to see if app is online before reading from the database
    if (navigator.onLine) {
        checkDatabase();

        console.log("App is not online. Read from the database.");
    }
};

request.onerror = function(e) {
    console.log("Houston, we have a problem.", e.target.errorCode);
};

function saveRecord(record) {
    console.log("record (saveRecord)", record);

    // Create a transaction in the pending database with read/write access
    const transaction = db.transaction(["pending"], "readwrite");
    console.log("Transaction created (saveRecord)", transaction);

    // Access the pending object store
    const store = transaction.objectStore("pending");
    console.log("Access store (saveRecord)", store);

    // Add record to the store with add method
    store.add(record);
    console.log("Add record to store", store);
}

function checkDatabase() {
    // Open a transaction in your pending database
    const transaction = db.transaction(["pending"], "readwrite");
    console.log("Transaction created (saveRecord)", transaction);

    // Access the pending object store
    const store = transaction.objectStore("pending");
    console.log("Access store (saveRecord)", store);

    // Get all records from store and set to a variable
    const getAll = store.getAll();
    console.log("Get all records from store", getAll);

    getAll.onsuccess = function() {
        console.log("Onsuccess!!!");
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
            .then(response => {
                response.json()
                console.log("response of onsuccess", response);
            })
            .then(() => {
                console.log("Do we ever make it in here?");
                // If successful, open a transaction in the pending db
                const transaction = db.transaction(["pending"], "readwrite");
                console.log("Transaction created (.then)", transaction);

                // Access the pending object store
                const store = transaction.objectStore("pending");
                console.log("Access store (.then)", store);

                // Clear all items in the store
                store.clear();
                console.log("Clear all records from store", store);
            });
        }
    }
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);