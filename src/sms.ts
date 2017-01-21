import * as config from "config";

if (
    !config.has("twilioSecrets.accountSID") ||
    !config.has("twilioSecrets.authToken") ||
    !config.has("twilioSecrets.phone")
) {
    console.error('You need to configure twilioSecrets with accountSID, authToken, and phone in a local.config!');
    process.exit();
}

let sid = config.get<string>("twilioSecrets.accountSID"),
    authToken = config.get<string>("twilioSecrets.authToken"),
    fromNumber = config.get<string>("twilioSecrets.phone");

let twilio = require("twilio")(sid, authToken);

export function sendMessage(toNumber: string, message: string): Promise<any> {
    return twilio.messages.create({
        to: toNumber,
        from: fromNumber,
        body: message
    });
}

// Usage example:

function example () {
    sendMessage("phone number of victim goes here", "surreal bizarro humor goes here").then(function (message) {
        console.log(message.sid);
    });
}
