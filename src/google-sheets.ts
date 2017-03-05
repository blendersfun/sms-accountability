import * as config from 'config';
import { FileUtils } from './file-utils';
import * as googleapis from 'googleapis';

export class GoogleSheets {
    private sheetsApi: googleapis.IGoogleSheets;

    static newConnection(): Promise<GoogleSheets> {
        return FileUtils.loadJson(config.get<string>('serviceAccountConfigPath'))
            .then(json => {
                let jwtClient = new googleapis.auth.JWT(json['client_email'], null, json['private_key'], [
                    'https://www.googleapis.com/auth/spreadsheets'
                ], null);

                return new Promise((resolve, reject) => {
                    jwtClient.authorize(err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(new GoogleSheets(jwtClient));
                        }
                    });
                });
            });
    }

    private constructor(
        private jwtClient: googleapis.IGoogleApisJWTClient
    ) {
        this.sheetsApi = googleapis.sheets('v4');
    }

    getSheetRange(sheetId: string, tabName: string, range: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.sheetsApi.spreadsheets.values.get(
                {
                    auth: this.jwtClient,
                    spreadsheetId: sheetId,
                    range: tabName +'!'+ range
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    writeCell(sheetId: string, tabName: string, cell: string, value: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let range = tabName +'!'+ cell + ':' + cell;
            this.sheetsApi.spreadsheets.values.update(
                {
                    auth: this.jwtClient,
                    spreadsheetId: sheetId,
                    range: range,
                    valueInputOption: "RAW",
                    resource: {
                        range: range,
                        majorDimension: "ROWS",
                        values: [ [value] ]
                    }
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });
    }
}

// Usage example:

function example() {
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
}
