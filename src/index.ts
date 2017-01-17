import { sendMessage } from "./sms";

sendMessage("phone number of victim goes here", "surreal bizarro humor goes here").then(function (message) {
    console.log(message.sid);
});
