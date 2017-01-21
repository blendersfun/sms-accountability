import { GoogleSheets } from './google-sheets';
import * as config from 'config';

GoogleSheets.newConnection().then(sheets => {
    let sheetId = config.get<string>('greatHouseMaintenance.googleSheetId');
    let tabName = config.get<string>('greatHouseMaintenance.scheduleName');
    sheets.getSheetRange(sheetId, tabName, 'B2:D')
        .then(data => {
            console.log(data);
        }).catch(error => {
            console.error(error);
        });

    sheets.writeCell(sheetId, tabName, 'E17', 'x').then(whatYouSendBack => {
        console.log('What is this shit? : ', whatYouSendBack);
    });
});
