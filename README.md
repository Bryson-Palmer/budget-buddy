# budget-buddy
A budget tracker with online/offline ability. 

function saveRecord(record) {
    TransactionStoreHandler(record);

    // Add record to the store with add method
    store.add(record);
}

function checkDatabase() {
    TransactionStoreHandler(record);

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
                    TransactionStoreHandler(record);


                    // Clear all items in the store
                    store.clear();
                });
        }
    }
}


function TransactionStoreHandler(store) {
    // If successful, open a transaction in the pending db
    const transaction = db.transaction(["pending"], "readwrite");

    // Access the pending object store
    const store = transaction.objectStore("pending");

    return store;
};
