import moment from 'moment';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DATES = Array.from({length: 31}, (_, i) => i + 1);
const currentTime = new Date();
export const CURR_YEAR = currentTime.getFullYear();
export const YEARS = Array.from({length: 110}, (_, i) => i + (CURR_YEAR - 109)).reverse();
export const CURR_MONTH = currentTime.getMonth();
export const CURR_DATE = currentTime.getDate();

export const isDateValid = (dateStr: string): boolean => {
    const date = moment(dateStr);
    return date.isValid();
};

export const MONTHS_NUM_TO_STR = Object.assign({}, MONTHS);
const monthsStrNumMap: {[key: string]: number} = {};
Object.keys(MONTHS_NUM_TO_STR).forEach(key => {
    monthsStrNumMap[MONTHS_NUM_TO_STR[parseInt(key, 10)]] = parseInt(key, 10);
});
export const MONTHS_STR_TO_NUM = monthsStrNumMap;

export const getDateDiffInMin = (oldDateStr: string, newDateStr: string): number => {
    const oldDate = Date.parse(oldDateStr);
    const newDate = Date.parse(newDateStr);
    return (newDate - oldDate) / 60000;
};
