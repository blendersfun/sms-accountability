import { GoogleSheets } from './google-sheets';
import * as config from 'config';

GoogleSheets.newConnection().then(sheets => {
    sheets.getSheetRange(
        config.get<string>('greatHouseMaintenance.googleSheetId'),
        config.get<string>('greatHouseMaintenance.scheduleName') + '!B2:D'
    ).then(data => {
        console.log(data);
    });
});
