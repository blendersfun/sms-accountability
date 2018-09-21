# Deployment Instructions for Lambda

 - `npm pack`
 - Extract `package` folder from tarball.
 - Copy contents of `config` into the extracted `package/config`.
 - Zip contents of package folder.
 - Deploy with aws cli. Example: `aws lambda update-function-code --function-name "sms-notifier-lambda" --zip-file "fileb://lambda.zip"`

## Config

You'll need to setup config folder. Create a `local.json`. Copy from `default.json`. You'll need to fill in the empty fields.

If you need to add a new security key to the google api's service account:

 - https://console.developers.google.com/projectselector/iam-admin/serviceaccounts?supportedpurview=project&project=&folder=&organizationId=

NOTE: serviceAccountConfigPath is relative to the root of the repository.

If you need to access the twilio account information:

 - https://www.twilio.com/console

## Deploy Script

See new `deploy.sh` script. Once you have the aws cli configured, you should be able to deploy simply by running this command.