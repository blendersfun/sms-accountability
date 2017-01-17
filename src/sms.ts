import * as config from "config";

let sid = config.get<string>("twilioSecrets.accountSID"),
    authToken = config.get<string>("twilioSecrets.authToken"),
    fromNumber = config.get<string>("twilioSecrets.phone");

if (!sid || !authToken || !fromNumber) {
    throw 'You need to configure twilioSecrets in a local.config in order to use this.';
}

let twilio = require("twilio")(sid, authToken);

export function sendMessage(toNumber: string, message: string): Promise<any> {
    return twilio.messages.create({
        to: toNumber,
        from: fromNumber,
        body: message
    });
}
