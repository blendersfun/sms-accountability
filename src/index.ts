import { sendMessage, setMessageReciever } from './sms';

sendMessage('+15034533916', 'Get your freaking paws on me.');
setMessageReciever((smsMessage) => {
    console.log(smsMessage.From, smsMessage.Body);
    sendMessage(smsMessage.From, 'I accept that. I accept that.');
});
