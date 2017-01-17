import * as config from "config";

let sid = config.get<string>("twilioSecrets.accountSID"),
    authToken = config.get<string>("twilioSecrets.authToken"),
    fromNumber = config.get<string>("twilioSecrets.phone");

if (!sid || !authToken || !fromNumber) {
    throw 'You need to configure twilioSecrets in a local.config in order to use this.';
}

let twilio = require("twilio")(sid, authToken);

twilio.messages.create({
    to: "+15034533916",
    from: fromNumber,
    body: "Don't beat a dead horse dry."
}, function (err: any, message: any) {
    console.log(message && message.sid);
});
