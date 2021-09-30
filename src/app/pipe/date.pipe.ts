import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
    transform(value: string): string {
        if (value === '') {
            return '';
        }
        if (!value.endsWith('Z')) { // change to ISO string
            value += 'Z';
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return value;
        }
        const dateNow = new Date();
        const currYear = dateNow.getFullYear();

        const year = date.getFullYear();
        let month;
        switch(date.getMonth()) {
            case 0:
                month = 'Jan';
                break;
            case 1:
                month = 'Feb';
                break;
            case 2:
                month = 'Mar';
                break;
            case 3:
                month = 'Apr';
                break;
            case 4:
                month = 'May';
                break;
            case 5:
                month = 'Jun';
                break;
            case 6:
                month = 'Jul';
                break;
            case 7:
                month = 'Aug';
                break;
            case 8:
                month = 'Sep';
                break;
            case 9:
                month = 'Oct';
                break;
            case 10:
                month = 'Nov';
                break;
            case 11:
                month = 'Dec';
                break;
        }
        const day = date.getDate();

        let hour = date.getHours();
        const isPM = hour >= 12 ? true : false;
        hour = hour > 12 ? hour - 12 : hour;
        const minute = date.getMinutes().toString().padStart(2, '0');

        return `${month} ${day}, ${year === currYear ? '' : year} ${hour}:${minute} ${isPM ? 'pm' : 'am'}`;
    }
}
