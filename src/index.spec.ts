import { sendNotificationsIfNeeded, notify, CodeIterator, completeTaskReciever, getCompletionMessage } from './index';
import { parseDate } from './datetime';
import * as chai from 'chai';

let aaron = { person: { val: 'Aaron' },  phone: { val: '+15436759345' } };
let nathan = { person: { val: 'Nathan' }, phone: { val: '+13456423456' } };
let theAliens = { person: { val: 'The Aliens' }, phone: { val: '+10000000000' } };
let bagMan = { person: { val: 'Bag Man' }, phone: { val: '+19999999999' } };
let contacts = [
    aaron,
    nathan,
    theAliens,
    bagMan
];
let defaultCurrentDay = parseDate('2/5/2017'); // Feb 5, 2017 in PST

describe("sendNotificationsIfNeeded", () => {

    describe("sending messages at the right times", () => {
        it("sends reminder message if an incomplete task is due tomorrow, if only a day is turning over", () => {
            let tasks = [{
                task: { val: 'Reduce all matter in the universe to a fine dust' },
                due: { val: '2/6/2017' },
                people: { val: 'The Aliens' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            chai.expect(messages[0]).not.to.be.undefined;
            chai.expect(messages[0][0]).to.equal(theAliens.phone.val);
            chai.expect(messages[0][1]).to.be.a('string');
            chai.expect(messages[0][1]).to.match(/Due tomorrow/);
        });
        it("sends reminder message if an incomplete task is due tomorrow, if a year is turning over", () => {
            let currentDate = parseDate('12/31/2016'); // Dec 31, 2016 in PST
            let tasks = [{
                task: { val: 'Reduce all matter in the universe to a fine dust' },
                due: { val: '1/1/2017' },
                people: { val: 'The Aliens' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, currentDate, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            chai.expect(messages[0]).not.to.be.undefined;
            chai.expect(messages[0][0]).to.equal(theAliens.phone.val);
            chai.expect(messages[0][1]).to.be.a('string');
        });
        it("sends reminder message if an incomplete task is due today", () => {
            let tasks = [{
                task: { val: 'Reduce all matter in the universe to a fine dust' },
                due: { val: '2/5/2017' },
                people: { val: 'The Aliens' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            chai.expect(messages[0]).not.to.be.undefined;
            chai.expect(messages[0][0]).to.equal(theAliens.phone.val);
            chai.expect(messages[0][1]).to.be.a('string');
            chai.expect(messages[0][1]).to.match(/Due today/);
        });
        it("sends reminder message if an incomplete task is late", () => {
            let tasks = [{
                task: { val: 'Reduce all matter in the universe to a fine dust' },
                due: { val: '2/4/2017' },
                people: { val: 'The Aliens' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            chai.expect(messages[0]).not.to.be.undefined;
            chai.expect(messages[0][0]).to.equal(theAliens.phone.val);
            chai.expect(messages[0][1]).to.be.a('string');
            chai.expect(messages[0][1]).to.match(/Late task/);
        });
        it("does not send a reminder if the date is more than 1 day in the future", () => {
            let tasks = [{
                task: { val: 'Reduce all matter in the universe to a fine dust' },
                due: { val: '2/7/2017' },
                people: { val: 'The Aliens' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            chai.expect(messages).to.be.empty;
        });
    });

    describe("sending messages to the right people", () => {
        it("sends messages to multiple people", () => {
            let tasks = [{
                task: { val: 'Make a fine, fine, *fine* breakfast for all the other roommates' },
                due: { val: '2/6/2017' },
                people: { val: 'Aaron, Nathan, The Aliens' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            let aaronMessage =  messages.filter(message => message[0] === aaron.phone.val);
            let nathanMessage = messages.filter(message => message[0] === nathan.phone.val);
            let aliensMessage = messages.filter(message => message[0] === theAliens.phone.val);

            chai.expect(aaronMessage).not.to.be.empty;
            chai.expect(nathanMessage).not.to.be.empty;
            chai.expect(aliensMessage).not.to.be.empty;
        });
        it("does not send to a person not in the assignee list", () => {
            let tasks = [{
                task: { val: 'Make a fine, fine, *fine* breakfast for all the other roommates' },
                due: { val: '2/6/2017' },
                people: { val: 'Aaron, The Aliens' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            let aaronMessage =  messages.filter(message => message[0] === aaron.phone.val);
            let nathanMessage = messages.filter(message => message[0] === nathan.phone.val);
            let aliensMessage = messages.filter(message => message[0] === theAliens.phone.val);

            chai.expect(aaronMessage).not.to.be.empty;
            chai.expect(nathanMessage).to.be.empty;
            chai.expect(aliensMessage).not.to.be.empty;
        });
    });

    describe("sending the right tasks", () => {
        it("does not send reminders about completed tasks", () => {
            let tasks = [{
                task: { val: 'Reduce all matter in the universe to a fine dust' },
                due: { val: '2/4/2017' },
                people: { val: 'The Aliens' },
                completed: { val: 'x' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            chai.expect(messages).to.be.empty; // Deafeningly empty...
        });
        it("sends reminders for incomplete tasks from a list with multiple tasks", () => {
            let tasks = [{
                task: { val: 'Reduce all matter in the universe to a fine dust' },
                due: { val: '2/4/2017' },
                people: { val: 'The Aliens' },
                code: { val: 'a' },
                completed: { val: 'x' }
            },{
                task: { val: 'Whisper funny rhymes to the cat' },
                due: { val: '2/4/2017' },
                people: { val: 'Nathan' },
                code: { val: 'a' },
                completed: { val: ' ' }
            },{
                task: { val: 'Go up on the roof and howl for several hours' },
                due: { val: '2/4/2017' },
                people: { val: 'Aaron' },
                code: { val: 'a' },
                completed: { val: '' }
            }];

            let messages: any[] = [];
            sendNotificationsIfNeeded(tasks, contacts, defaultCurrentDay, (toNumber, message) => {
                messages.push([toNumber, message]);
            });

            let aaronMessage =  messages.filter(message => message[0] === aaron.phone.val);
            let nathanMessage = messages.filter(message => message[0] === nathan.phone.val);
            let aliensMessage = messages.filter(message => message[0] === theAliens.phone.val);

            chai.expect(aaronMessage).not.to.be.empty;
            chai.expect(nathanMessage).not.to.be.empty;
            chai.expect(aliensMessage).to.be.empty;
        });
    });
});

describe('notify', function () {
    describe('includes appropriate details in message body', function () {
        describe('includes partners in crime', function () {
            it('formats well with zero partners', function () {
                let task = {
                    task: { val: 'Go up on the roof and howl for several hours' },
                    due: { val: '2/4/2017' },
                    people: { val: 'Aaron' },
                    code: { val: 'a' },
                    completed: { val: '' }
                };

                let messages: any[] = [];
                notify(task, contacts, (toNumber: string, message: string) => {
                    messages.push([toNumber, message]);
                }, 'Due Tomorrow: ');
                chai.expect(messages).not.to.be.empty;
                chai.expect(messages[0][1]).to.contain('We\'re all depending on you.');
            });
            it('formats well with one partner', function () {
                let task = {
                    task: { val: 'Go up on the roof and howl for several hours' },
                    due: { val: '2/4/2017' },
                    people: { val: 'Aaron, Nathan' },
                    code: { val: 'a' },
                    completed: { val: '' }
                };

                let messages: any[] = [];
                notify(task, contacts, (toNumber: string, message: string) => {
                    messages.push([toNumber, message]);
                }, 'Due Tomorrow: ');
                chai.expect(messages).not.to.be.empty;
                chai.expect(messages[0][1]).to.contain('Your partner in crime is Nathan.');
                chai.expect(messages[1][1]).to.contain('Your partner in crime is Aaron.');
            });
            it('formats well with two partners', function () {
                let task = {
                    task: { val: 'Go up on the roof and howl for several hours' },
                    due: { val: '2/4/2017' },
                    people: { val: 'Aaron, Nathan, The Aliens' },
                    code: { val: 'a' },
                    completed: { val: '' }
                };

                let messages: any[] = [];
                notify(task, contacts, (toNumber: string, message: string) => {
                    messages.push([toNumber, message]);
                }, 'Due Tomorrow: ');
                chai.expect(messages).not.to.be.empty;
                chai.expect(messages[0][1]).to.contain('Your partners in crime are Nathan and The Aliens.');
                chai.expect(messages[1][1]).to.contain('Your partners in crime are Aaron and The Aliens.');
                chai.expect(messages[2][1]).to.contain('Your partners in crime are Aaron and Nathan.');
            });
            it('formats well with three partners', function () {
                let task = {
                    task: { val: 'Go up on the roof and howl for several hours' },
                    due: { val: '2/4/2017' },
                    people: { val: 'Aaron, Nathan, The Aliens, Bag Man' },
                    code: { val: 'a' },
                    completed: { val: '' }
                };

                let messages: any[] = [];
                notify(task, contacts, (toNumber: string, message: string) => {
                    messages.push([toNumber, message]);
                }, 'Due Tomorrow: ');
                chai.expect(messages).not.to.be.empty;
                chai.expect(messages[0][1]).to.contain('Your partners in crime are Nathan, The Aliens, and Bag Man.');
                chai.expect(messages[1][1]).to.contain('Your partners in crime are Aaron, The Aliens, and Bag Man.');
                chai.expect(messages[2][1]).to.contain('Your partners in crime are Aaron, Nathan, and Bag Man.');
                chai.expect(messages[3][1]).to.contain('Your partners in crime are Aaron, Nathan, and The Aliens.');
            });
        });
    });
});

describe('CodeIterator', function () {
    it('creates unique codes', function () {
        let codes = new Set<string>();
        for (let i = 0; i < 500; i++) {
            codes.add(CodeIterator.n2base26(i));
        }
        chai.expect(codes.size).to.equal(500);
    });
});

describe('getCompletionMessage', function () {
    it('returns a string', function () {
        let message = getCompletionMessage();
        chai.expect(message).not.to.be.undefined;
        chai.expect(message.length).to.be.greaterThan(0);
    });
});