import {dbApi, precipitationStoreName} from "./index.js"


export const precipitationStore = {
    getAll: () => new Promise((async (resolve, reject) => {
        try {
            const result = await dbApi.getAll(precipitationStoreName);
            resolve(result)
        } catch (ex) {
            reject(ex)
        }
    }))
    ,
    putAll: (values) => new Promise(async (resolve, reject) => {
        try {
            const result = await dbApi.putAll(precipitationStoreName, values)
            resolve(result)
        } catch (ex) {
            reject(ex)
        }
    })

}