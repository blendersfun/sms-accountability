import { GoogleSheets } from './google-sheets';
import * as config from 'config';
import { getCurrentDatetime, parseDate } from './datetime';
import { sendMessage } from "./sms";

function runMeOnceADayAtTheCorrectTime() {
    GoogleSheets.newConnection().then(sheets => {
            let sheetId = config.get<string>('greatHouseMaintenance.googleSheetId');
            let scheduleName = config.get<string>('greatHouseMaintenance.scheduleName');
            let contactSheetName = config.get<string>('greatHouseMaintenance.contactSheetName');

            let schedulePromise = sheets.getSheetRange(sheetId, scheduleName, 'B:E');
            let contactsPromise = sheets.getSheetRange(sheetId, contactSheetName, 'A:D');

            return Promise.all([schedulePromise, contactsPromise])
                .then(([scheduleData, contactsData]) => {
                    let tasks = parseTable(['task', 'due', 'people', 'completed'], scheduleData.values);
                    let contacts = parseTable(['person', 'phone'], contactsData.values);

                    sendNotificationsIfNeeded(tasks, contacts, getCurrentDatetime(), (toNumber, message) => {
                        sendMessage(toNumber, message);
                    });
                });
        })
        .catch(error => {
            console.error('Something went *horribly* wrong: ', error);
        });
}

function parseTable(titles: string[], values: any[]): any[] {
    titles = titles.map(title => title.toLowerCase());
    let titleRow = values[0].map((titleRowItem: any) => titleRowItem.toLowerCase());

    let indexToTitle = new Map<string, number>(); // Index into value row that the data for each title exists.
    titles.forEach(title => {
        let found = 0;
        titleRow.forEach((titleRowItem: any, i: number) => {
            if (titleRowItem.indexOf(title) !== -1) {
                indexToTitle.set(title, i);
                found++;
            }
        });

        if (found < 1) {
            throw `No row headings were found that match "${title}."`
        } else if (found > 1) {
            throw `Multiple row headings were found that match "${title}."`
        }
    });

    return values.slice(1).map(row => {
        let newRow: {[index:string]: string} = {};
        indexToTitle.forEach((i, title) => {
            newRow[title] = row[i];
        });
        return newRow;
    });
}

type SendTextCallback = (toNumber: string, message: string) => void;

export function sendNotificationsIfNeeded(
    tasks: any,
    contacts: any,
    currentDate: Date,
    sendTextCallback: SendTextCallback
) {
    let currentDateMS = killTime(currentDate).getTime();

    tasks.forEach((task: any) => {
        if (task.completed && task.completed.trim() !== '') return;
        let taskDate = killTime(parseDate(task.due)).getTime(); // Todo: timezones.

        if (currentDateMS > taskDate) { // Late:
            notify(task, contacts, sendTextCallback, 'Late task: ');
        } else if (currentDateMS < taskDate) {
            let tomorrow = new Date(currentDate);
            tomorrow.setDate(tomorrow.getDate() + 1); // This is weird... but works.

            if (tomorrow.getTime() === taskDate) { // Tomorrow:
                notify(task, contacts, sendTextCallback, 'Due tomorrow: ');
            }
        } else { // Today:
            notify(task, contacts, sendTextCallback, 'Due today: ');
        }
    });

    // If: task is completed, ignore it.
    // If: tasks are any of:
    //   a. due tomorrow
    //   b. due today
    //   c. fucking late
    //   Send a reminder SMS.
    //   Ignore all others.
}

function notify(task: any, contacts: any, sendTextCallback: SendTextCallback, prependMessage: string) {
    if (task.people) {
        let people = task.people.split(/\s*,\s*/g).map((person: any) => {
            return contacts.filter((contact: any) => contact.person === person)[0];
        });
        people.forEach((person: any) => {
            sendTextCallback(formatPhoneForTwilio(person.phone), prependMessage + task.task);
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

function killTime(date: Date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

function setupSuperAwesomeGoodTimes() {
    let now = getCurrentDatetime();
    let nextGoodTimes = getCurrentDatetime();

    nextGoodTimes.setMilliseconds(0);
    nextGoodTimes.setSeconds(0);
    nextGoodTimes.setMinutes(0);
    nextGoodTimes.setHours(12);

    if (nextGoodTimes <= now) {
        nextGoodTimes.setDate(nextGoodTimes.getDate() + 1); // This is weird... but works.
    }

    let diffMillis = nextGoodTimes.getTime() - now.getTime();
    setTimeout(() => {
        runMeOnceADayAtTheCorrectTime();
        setupSuperAwesomeGoodTimes();
    }, diffMillis);
}

setupSuperAwesomeGoodTimes();
