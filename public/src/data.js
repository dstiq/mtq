import {temperatureStore} from "./utils/db/temperature.js";
import {getPrecipitation, getTemperature} from "./api.js";
import {precipitationStore} from "./utils/db/precipitation.js";

/**
 * Методы, которые достают данные. Если данных нет в indexedDB - запросим из API
 * @type {{getTemperature: (function(): unknown), getPrecipitation: (function(): unknown)}}
 */
export const data = {

    getTemperature: async () => {

        let temperature = await temperatureStore.getAll();
        if (temperature.length === 0) {

            let result = await getTemperature()
            temperature = result.map(value => ({date: value.t, value: value.v}))
            await temperatureStore.putAll(temperature);
        }
        return temperature;
    },
    getPrecipitation: async () => {

        let precipitation = await precipitationStore.getAll();
        if (precipitation.length === 0) {

            let result = await getPrecipitation();
            precipitation = result.map(value => ({date: value.t, value: value.v}))
            await precipitationStore.putAll(precipitation);
        }
        return precipitation
    }
}