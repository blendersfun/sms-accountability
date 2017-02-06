import * as moment from 'moment-timezone';

let timezone = 'America/Los_Angeles';

export function getCurrentDatetime(): Date {
    return moment.tz(timezone).toDate();
}
export function parseDate(dateString: string): Date {
    return moment.tz(dateString, "M/D/YYYY", timezone).toDate();
}
