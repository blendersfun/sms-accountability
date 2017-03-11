import { GoogleSheets } from './google-sheets';
import * as config from 'config';
import { getCurrentDatetime, parseDate } from './datetime';
import { sendMessage, setMessageReciever } from "./sms";
import * as moment from 'moment-timezone';

function runMeOnceADayAtTheCorrectTime() {
    let sheetId = config.get<string>('greatHouseMaintenance.googleSheetId');
    let scheduleName = config.get<string>('greatHouseMaintenance.scheduleName');
    let contactSheetName = config.get<string>('greatHouseMaintenance.contactSheetName');
    let sheets: GoogleSheets = null;

    GoogleSheets.newConnection().then(sheetsConnection => {
            sheets = sheetsConnection;
            return reconcileCompletionCodes(sheets, sheetId, scheduleName);
        })
        .then(() => {
            let schedulePromise = sheets.getSheetRange(sheetId, scheduleName, 'B:F');
            let contactsPromise = sheets.getSheetRange(sheetId, contactSheetName, 'A:D');

            return Promise.all([schedulePromise, contactsPromise])
                .then(([scheduleData, contactsData]) => {
                    let tasks = parseTable(['task', 'due', 'people', 'completed', 'code'], scheduleData);
                    let contacts = parseTable(['person', 'phone'], contactsData);

                    sendNotificationsIfNeeded(tasks, contacts, getCurrentDatetime(), (toNumber, message) => {
                        sendMessage(toNumber, message);
                    });
                });
        })
        .catch(error => {
            console.error('Something went *horribly* wrong: ', error);
        });
}

function reconcileCompletionCodes(sheets: GoogleSheets, sheetId: string, scheduleName: string): Promise<void> {
    return sheets.getSheetRange(sheetId, scheduleName, 'B:F').then(scheduleData => {
        let tasks = parseTable(['due', 'completed', 'code'], scheduleData);
        let tableUpdates: Promise<any>[] = [];
        let occupiedCodes =  new Set<string>();
        let cellsNeedingCodes: any[] = [];

        //  1. remove completion codes from completed items.
        //  2. build a list of occupied codes, and cells needing codes
        tasks.forEach(task => {
            if (isTaskComplete(task)) {
                if (task.code.val) {
                    tableUpdates.push(
                        sheets.writeCell(sheetId, scheduleName, task.code.cell, '')
                    );
                }
            } else {
                if (task.code.val) {
                    occupiedCodes.add(task.code.val);
                } else {
                    if (task.due.val) { // Make sure it has a due date to ignore comment lines.
                        cellsNeedingCodes.push(task.code.cell);
                    }
                }
            }
        });

        //  3. fill in codes for cells that need them
        cellsNeedingCodes.forEach(cell => {
            for (let iter = new CodeIterator(), code = iter.next(); true; code = iter.next()) {
                if (!occupiedCodes.has(code)) {
                    occupiedCodes.add(code);
                    tableUpdates.push(
                        sheets.writeCell(sheetId, scheduleName, cell, code)
                    );
                    break;
                }
            }
        });

        return Promise.all(tableUpdates)
    }).then(() => {});
}

// An iterator that returns unique alphabetic codes by converting
// a numeric sequence to base 26 using the alphabet as it's symbols.
export class CodeIterator {
    private count = 0;

    next(): string {
        let code = CodeIterator.n2base26(this.count);
        this.count++;
        return code;
    }

    public static n2base26(n: number): string {
        let base = 26;
        let digits = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

        if (n < 0) {
            return "";
        }

        let s = "";
        while (true) {
            let r = n % base;
            s = digits[r] + s;
            n = Math.floor(n / base);
            if (n == 0) {
                break;
            }
        }

        return s;
    }
}

function parseTable(titles: string[], tableData: any): any[] {
    let values = tableData.values;
    let range = tableData.range.slice(tableData.range.indexOf('!') + 1);

    titles = titles.map(title => title.toLowerCase());
    let titleRow = values[0].map((titleRowItem: any) => titleRowItem.toLowerCase());

    let titleToMetaData = new Map<string, any>(); // Index into value row that the data for each title exists.
    titles.forEach(title => {
        let found = 0;
        titleRow.forEach((titleRowItem: any, i: number) => {
            if (titleRowItem.indexOf(title) !== -1) {
                titleToMetaData.set(title, {
                    index: i,
                    col: String.fromCharCode(range.charCodeAt(0) + i) // Starting column letter plus index.
                });
                found++;
            }
        });

        if (found < 1) {
            throw `No row headings were found that match "${title}."`
        } else if (found > 1) {
            throw `Multiple row headings were found that match "${title}."`
        }
    });

    return values.slice(1).map((row: any, i: number) => {
        let newRow: {[index:string]: any} = {};
        titleToMetaData.forEach((meta, title) => {
            newRow[title] = {
                val: row[meta.index],
                cell: meta.col + (i + 2) // Compensate for slice off of titles and google sheets not being zero indexed.
            };
        });
        return newRow;
    });
}

type SendTextCallback = (toNumber: string, message: string) => void;

function isTaskComplete(task: any): boolean {
   return task.completed.val && task.completed.val.trim() !== '';
}

export function sendNotificationsIfNeeded(
    tasks: any,
    contacts: any,
    currentDate: moment.Moment,
    sendTextCallback: SendTextCallback
) {
    let currentDateMS = killTime(currentDate).valueOf();

    tasks.forEach((task: any) => {
        if (isTaskComplete(task)) return;
        let taskDate = killTime(parseDate(task.due.val)).valueOf();

        if (currentDateMS > taskDate) { // Late:
            notify(task, contacts, sendTextCallback, 'Late task: ');
        } else if (currentDateMS < taskDate) {
            let tomorrow = moment(currentDate);
            tomorrow.add(1, 'days');

            if (tomorrow.valueOf() === taskDate) { // Tomorrow:
                notify(task, contacts, sendTextCallback, 'Due tomorrow: ');
            }
        } else { // Today:
            notify(task, contacts, sendTextCallback, 'Due today: ');
        }
    });
}

export function notify(task: any, contacts: any, sendTextCallback: SendTextCallback, prependMessage: string) {
    if (task.people.val) {
        let people = task.people.val.split(/\s*,\s*/g).map((person: any) => {
            return contacts.filter((contact: any) => contact.person.val === person)[0];
        });
        people.forEach((person: any) => {
            let otherPeople = people.filter((otherPerson: any) => otherPerson !== person);
            let partners = ` We're all depending on you.`;
            if (otherPeople.length === 1) {
                partners = ` Your partner in crime is ${otherPeople[0].person.val}.`;
            } else if (otherPeople.length === 2) {
                partners  = ` Your partners in crime are ${otherPeople[0].person.val} and ${otherPeople[1].person.val}.`;
            } else if (otherPeople.length > 2) {
                let lastPartner = otherPeople.pop();
                partners  = ` Your partners in crime are ${otherPeople.map((c: any) => c.person.val).join(', ')}, and ${lastPartner.person.val}.`;
            }
            let markingComplete = ` Text back "${task.code.val}" when completed.`;
            sendTextCallback(formatPhoneForTwilio(person.phone.val), `${prependMessage}${task.task.val}.${partners}${markingComplete}`);
        });
    }
}

// Input number is expected to leave off country code. USA is assumed for now.
function formatPhoneForTwilio(number: string): string {
    let result = number.replace(/[^\d]+/g, '');
    if (result.length < 11) {
        result = '1' + result;
    }
    return '+' + result;
}

function killTime(date: moment.Moment): moment.Moment {
    date.hour(0);
    date.minute(0);
    date.second(0);
    date.millisecond(0);
    return date;
}

function setupSuperAwesomeGoodTimes() {
    if (config.has("testMode") && config.get<boolean>("testMode")) {
        runMeOnceADayAtTheCorrectTime();
    } else {
        let now = getCurrentDatetime();
        let nextGoodTimes = getCurrentDatetime();

        nextGoodTimes.millisecond(0);
        nextGoodTimes.second(0);
        nextGoodTimes.minute(0);
        nextGoodTimes.hour(12);

        if (nextGoodTimes <= now) {
            nextGoodTimes.add(1, 'days');
        }

        let diffMillis = nextGoodTimes.valueOf() - now.valueOf();
        setTimeout(() => {
            runMeOnceADayAtTheCorrectTime();
            setupSuperAwesomeGoodTimes();
        }, diffMillis);
    }
}

setupSuperAwesomeGoodTimes();

export function completeTaskReciever(smsMessage: any) {
    console.log('I have recieved this!', smsMessage);

    let normalizePhone = (phone: string) => phone.replace(/[^\d]/g, '');

    let code = smsMessage.Body.replace(/\s*/g, '').toLocaleLowerCase();
    let from = normalizePhone(smsMessage.From).slice(1);

    return GoogleSheets.newConnection().then(sheets => {

        let sheetId = config.get<string>('greatHouseMaintenance.googleSheetId');
        let scheduleName = config.get<string>('greatHouseMaintenance.scheduleName');
        let contactSheetName = config.get<string>('greatHouseMaintenance.contactSheetName');

        let schedulePromise = sheets.getSheetRange(sheetId, scheduleName, 'B:F');
        let contactsPromise = sheets.getSheetRange(sheetId, contactSheetName, 'A:D');

        return Promise.all([schedulePromise, contactsPromise])
            .then(([scheduleData, contactsData]) => {
                let tasks = parseTable(['task', 'people', 'completed', 'code'], scheduleData);
                let contacts = parseTable(['person', 'phone'], contactsData);

                let person = contacts.find(contact => normalizePhone(contact.phone.val) === from);

                if (person) {
                    let task = tasks.find(task => task.code.val === code);
                    if (task) {
                        if (task.people.val.indexOf(person.person.val) !== -1) {
                            return sheets.writeCell(sheetId, scheduleName, task.completed.cell, 'x')
                                .then(() => sendMessage(formatPhoneForTwilio(person.phone.val), `"${task.task.val}" has been marked complete.`))
                                .catch(error => console.error('Failed to reply about successful completion:', error));
                        } else {
                            return sendMessage(formatPhoneForTwilio(person.phone.val), 'WTF?! You ain\'t even assigned to that task, foo!');
                        }
                    } else {
                        return sendMessage(formatPhoneForTwilio(person.phone.val), 'WTF?! That task ain\'t even there, bud!');
                    }
                }
            });
    })
    .catch(error => {
        console.error('Something went *horribly* wrong: ', error);
    });
}

setMessageReciever(completeTaskReciever);
