import { clipboard } from 'electron';

const pairToObject = ({ pair }) => {
    const [from, to] = pair.split('-');

    return { from, to };
};

const copyToClipboard = text => {
    clipboard.writeText(text);
};

const to = promise => {
    return promise.then(data => [null, data]).catch(err => [err]);
};

const dateFormat = (date, options = {}) => {
    const d = new Date(date);

    if (isNaN(d)) return '';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const h = d.getHours();
    const m = d.getMinutes();

    let formattedDate = `${d.getDate()}/${months[d.getMonth()]}/${d.getFullYear()} ${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}`;

    if (options.seconds) {
        const s = d.getSeconds();

        formattedDate += `:${s < 10 ? `0${s}` : s}`;
    }

    return formattedDate;
};

const isNumber = n => !isNaN(parseFloat(n)) && !isNaN(n - 0);

export default {
    to,
    pairToObject,
    copyToClipboard,
    dateFormat,
    isNumber,
};
