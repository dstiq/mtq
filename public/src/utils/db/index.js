export const dbName = "the_name";



var request = indexedDB.open(dbName, 1);

request.onerror = function(event) {
    console.log(event)
};

export const temperatureStoreName = "temperature";
export const precipitationStoreName = "precipitation";

request.onupgradeneeded = function(event) {

    var db = event.target.result;

    var temperatureObjectStore = db.createObjectStore(temperatureStoreName, { keyPath: "date" });
    temperatureObjectStore.createIndex("value", "value", { unique: false });

    var precipitationObjectStore = db.createObjectStore(precipitationStoreName, { keyPath: "date" });
    precipitationObjectStore.createIndex("value", "value", { unique: false });

};

export const openDb = () => new Promise(async (resolve, reject) => {
    var request = indexedDB.open(dbName, 1);

    request.onerror = function(event) {
        reject(event)
    };
    request.onsuccess = function (event) {
        resolve(event.target.result);
    }
})

export const dbApi = {

    getAll: (storeName) => new Promise((async (resolve, reject) => {

        try {

            const db = await openDb();
            const transaction = db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName)
            const request = await store.getAll();

            transaction.oncomplete = () => {
                db.close()
                resolve(request.result)
            }
            transaction.onerror = (e) => {
                db.close()
                reject(e)
            }
        } catch (ex) {
            reject(ex)
        }
    })),
    putAll: (storeName, values) => new Promise((async (resolve, reject) => {

        try {

            const db = await openDb();
            const transaction = db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName)

            for (let value of values) {
                await store.add(value)
            }

            transaction.oncomplete = (e) => {
                db.close()
                resolve(true)
            }
            transaction.onerror = (e) => {
                db.close()
                reject(e)
            }
        } catch (ex) {
            reject(ex)
        }
    }))
}