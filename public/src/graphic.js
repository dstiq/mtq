import {data} from "./data.js";

/**
 * Функция, которая занимается рисованием графика
 * @returns {Promise<void>}
 */
export async function drawGraphic() {


    let values = await data.getTemperature()

    const minMaxY = getMinMaxValues(values);
    const optionsX = getYearsKey(values);

    values = sortByDate(values);

    let drawContext = prepareGraphic(values,
        {
            x: {key: "date", legend: "Дата"},
            y: {key: "value", legend: "Температура, градусов цельсия"},
            optionsX: optionsX,
            optionsY: minMaxY
        });

    drawContext()


    const buttonTemperature = document.getElementById("button_temperature")
    const buttonPrecipitation = document.getElementById("button_precipitation")

    const getFromTo = () => {
        const from = document.getElementById("graphic_filter-from")
        const to = document.getElementById("graphic_filter-to")
        return {from: from.value, to: to.value}

    }

    const onClickTemperature = async (e) => {
        const values = await data.getTemperature()
        const minMax = getMinMaxValues(values);
        const options = getYearsKey(values);

        const sortedMap = sortByDate(values);
        const {from, to} = getFromTo()
        drawContext = prepareGraphic(sortedMap,
            {
                x: {key: "date", legend: "Дата"},
                y: {key: "value", legend: "Температура, градусов цельсия"},
                optionsX: options,
                optionsY: minMax
            });

        drawContext(from, to)
    }

    const onClickPrecipitation = async (e) => {

        const values = await data.getPrecipitation()
        const minMax = getMinMaxValues(values);
        const options = getYearsKey(values);

        const sortedMap = sortByDate(values);
        const {from, to} = getFromTo()
        drawContext = prepareGraphic(sortedMap,
            {
                x: {key: "date", legend: "Дата"},
                y: {key: "value", legend: "Осадки, мм"},
                optionsX: options,
                optionsY: minMax
            })
        drawContext(from, to)
    }

    const from = document.getElementById("graphic_filter-from")
    const to = document.getElementById("graphic_filter-to")

    buttonPrecipitation.addEventListener("click", onClickPrecipitation);
    buttonTemperature.addEventListener("click", onClickTemperature);

    from.addEventListener("change", () => {
        const {from, to} = getFromTo()
        drawContext(from, to)
    });

    to.addEventListener("change", () => {
        const {from, to} = getFromTo()
        drawContext(from, to)
    });

    /**
     *
     * @param {Record<string, {date: string, value: number}>} values
     * @param {string[]} optionsX
     * @param {min: number, max: number} optionsY
     * @param {string} xKey
     * @param {string} xLegend
     * @param {string} yKey
     * @param {string} yLegend
     */
    function prepareGraphic(values, {
        optionsX,
        optionsY,
        x: {legend: xLegend},
        y: {legend: yLegend}
    }) {
        let arrValues = Object.values(values);

        const options_from = document.createDocumentFragment();
        const options_to = document.createDocumentFragment();

        optionsX.forEach((key, i) => {
            let fromOption = createOption(key)
            let toOption = createOption(key)

            if (i === 0) {
                fromOption.selected = "selected"
            }
            if (i === optionsX.length - 1) {
                toOption.selected = "selected";
            }

            options_from.appendChild(fromOption)
            options_to.appendChild(toOption)
        })

        const from = document.getElementById("graphic_filter-from")
        const to = document.getElementById("graphic_filter-to")

        from.appendChild(options_from);
        to.appendChild(options_to)

        let canvas = document.getElementById("graphic_canvas");
        let ctx = canvas.getContext('2d');

        let startX = 100;
        let startY = 100;

        let contextWidth = canvas.offsetWidth - startX;
        let contextHeight = canvas.offsetHeight - startY;

        let yGap;


        return function (from = optionsX[0], to = optionsX[optionsX.length - 1]) {

            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
            ctx.beginPath()

            initX(from, to);
            initY();
            draw(arrValues, from, to)

            ctx.closePath()
        }

        /**
         * Метод инициализации оси Х
         * @param from
         * @param to
         */
        function initX(from, to) {

            ctx.moveTo(0, canvas.offsetHeight - startY);
            ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight - startY);
            ctx.stroke();

            let fromIndex = optionsX.indexOf(from);
            let toIndex = optionsX.indexOf(to);

            let xGapPx = contextWidth / (toIndex - fromIndex);

            let lineHeight = 3;

            for (let i = fromIndex; i <= toIndex; i) {

                let x = startX + (xGapPx * i) - (xGapPx * (fromIndex))

                ctx.fillText(optionsX[i], x, (canvas.offsetHeight - startY) + (lineHeight * 5))
                ctx.moveTo(x, (canvas.offsetHeight - startY) - lineHeight)
                ctx.lineTo(x, (canvas.offsetHeight - startY) + lineHeight)
                ctx.stroke()

                i = i + 5 > toIndex ? i + 1 : i + 5;
            }
        }

        /**
         * Метод инициализации оси Y
         */
        function initY() {
            const {min, max} = optionsY;

            ctx.moveTo(startX, 0);
            ctx.lineTo(startX, canvas.offsetHeight);
            ctx.stroke();

            yGap = contextHeight / (max - min);
            let lineHeight = 3;

            for (let i = min; i < max; i) {

                const y = (canvas.offsetHeight - startY) - (yGap * (i - min))
                ctx.moveTo(startX - lineHeight, y)
                ctx.lineTo(startX + lineHeight, y)
                ctx.stroke()
                ctx.fillText(i, startX - lineHeight * 10, y + 5);
                i = i + 3 > max ? i + 1 : i + 3;
            }
        }

        /**
         * Метод отрисовки линий графика.
         * @param values
         * @param fromValue
         * @param toValue
         */
        function draw(values, fromValue = from.value, toValue = to.value) {

            let count = 0;
            values.forEach((val, i) => {
                const year = new Date(values[i]?.date).getFullYear();
                if (year >= Number(fromValue) && year <= toValue) {
                    count++;
                }
            })
            let xGapPx = canvas.offsetWidth / count;
            ctx.moveTo(startX, startY)

            let i = 0;
            let cursor = 0;
            let isContinueDraw = true;
            while (isContinueDraw) {

                if (values[cursor]) {

                    const date = values[cursor]?.date;
                    const year = new Date(date).getFullYear();

                    if (year >= Number(fromValue) && year <= toValue) {
                        ctx.lineTo(startX + (xGapPx * i), ((yGap * values[cursor].value) - (optionsY.min * yGap)));
                        i++
                    }
                } else {
                    isContinueDraw = false
                }
                cursor++;
            }
            ctx.lineWidth = 0.5
            ctx.stroke();
        }
    }
}

function createOption(key) {
    const elem = document.createElement('option')
    elem.value = key
    elem.innerHTML = key;
    return elem;
}

/**
 *
 * @param {{date: string, value: number}[]} values
 * @returns {{min: number, max: number}}
 */
function getMinMaxValues(values) {

    let min = 0;
    let max = 0;

    values.forEach(({date, value}) => {
        if (value < min) min = value;
        if (value > max) max = value;
    })

    return {min, max};
}

/**
 *
 * @param {{date: string, value: number}[]} values
 * @returns {string[]}
 */
function getYearsKey(values) {
    const result = {};
    values.forEach(value => {
        const year = new Date(value.date).getFullYear();
        result[year] = year;
    })
    return Object.keys(result).sort();
}

/**
 *
 * @param {Array<{date: string, value: number}>} values
 * @returns {Record<string, {date: string, value: number}>}
 */
function sortByDate(values) {
    const result = {}
    values.sort((a, b) => {
        return Date.parse(a.date) - Date.parse(b.date)
    })
    values.forEach(e => result[e.date] = e)
    return result;
}