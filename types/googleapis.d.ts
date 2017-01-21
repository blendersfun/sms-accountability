declare module "googleapis" {

    let g: g.IGoogleApis;

    namespace g {
        interface IGoogleApisJWTClient {
            authorize: (callback?: (err: any, result: any) => any) => void
        }
        interface IGoogleApisAuth {
            JWT: new (email: any, keyFile: any, key: any, scopes: any, subject: any) => IGoogleApisJWTClient
        }
        interface IGoogleSheetsSpreadsheetsValues {
            get: (
                params: {
                    auth: IGoogleApisJWTClient,
                    spreadsheetId: string,
                    range: string
                },
                callback: (err: any, response: any) => void
            ) => any,
            update: (
                params: {
                    auth: IGoogleApisJWTClient,
                    spreadsheetId: string,
                    range: string,
                    valueInputOption: string,
                    resource: any
                },
                callback: (err: any, response: any) => void
            ) => any
        }
        interface IGoogleSheetsSpreadsheets {
            values: IGoogleSheetsSpreadsheetsValues
        }
        interface IGoogleSheets {
            spreadsheets: IGoogleSheetsSpreadsheets
        }
        interface IGoogleApis {
            auth: IGoogleApisAuth,
            sheets: (version: any) => IGoogleSheets
        }
    }

    export = g;
}
