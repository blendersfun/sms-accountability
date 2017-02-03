import * as express from 'express';
import * as bodyParser from 'body-parser';
import { GoogleSheets } from './google-sheets';
import { sendMessage } from './sms';
import * as config from 'config';

let app = express();
app.use(bodyParser.urlencoded({extended: false}));

app.get('/irritate-soren', function (req, res) {
    let sorensNumber = config.get<string>('sorensNumber');
    sendMessage(sorensNumber, "Hey Soren! How's it going tonight?").then(function (message) {
        res.send(message);
    });
});

app.post('/sms-webhook', function (req: any, res: any) {
    GoogleSheets.newConnection().then(sheets => {
        let sheetId = config.get<string>('greatHouseMaintenance.googleSheetId');
        let tabName = config.get<string>('greatHouseMaintenance.scheduleName');
        sheets.getSheetRange(sheetId, tabName, 'B2:D')
            .then(data => {
                console.log(data);
            }).catch(error => {
            console.error(error);
        });

        sheets.writeCell(sheetId, tabName, 'E17', req.body.Body).then(whatYouSendBack => {
            console.log('What is this shit? : ', whatYouSendBack);
        });
    });
    res.send('<Response><Message>Well, aren\'t you just the squeaky bees!</Message></Response>');
});

app.listen(55555, function () {
    console.log('Example app listening on port 55555!');
});
