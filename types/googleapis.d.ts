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
                config: {
                    auth: IGoogleApisJWTClient,
                    spreadsheetId: string,
                    range: string
                },
                callback: (err: any, response: any) => void
            ) => void
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
