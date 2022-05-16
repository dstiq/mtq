export const getTemperature = () => fetch("api/temperature").then(data => data.json());
export const getPrecipitation = () => fetch("api/precipitation").then(data => data.json());