import * as moment from 'moment-timezone';

let timezone = 'America/Los_Angeles';

export function getCurrentDatetime(): moment.Moment {
    return moment.tz(timezone);
}
export function parseDate(dateString: string): moment.Moment {
    return moment.tz(dateString, "M/D/YYYY", timezone);
}
export function parseAndLocalizeDatetime(dateString: string): moment.Moment {
    return moment(dateString).tz(timezone);
}
