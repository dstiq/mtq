import {dbApi, temperatureStoreName} from "./index.js";

/**
 * Методры для работы с API базы данных indexedDB.
 * @type {{getAll: (function(): Promise<unknown>), putAll: (function(*): Promise<unknown>)}}
 */
export const temperatureStore = {

    getAll: () => new Promise((async (resolve, reject) => {

        try {
            const result = await dbApi.getAll(temperatureStoreName)
            resolve(result)
        } catch (ex) {
            reject(ex)
        }
    })),
    putAll: async (values) => new Promise(async (resolve, reject) => {

        values.map(value => ({date: value.t, value: value.v}))
        try {
            const result = dbApi.putAll(temperatureStoreName, values)
            resolve(result)
        } catch (ex) {
            reject(ex);
        }
    })
}