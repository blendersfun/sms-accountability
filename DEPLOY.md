Deployment Instructions for Lambda
==================================

 - `npm pack`
 - Extract `package` folder from tarball.
 - Copy contents of `config` into the extracted `package/config`.
 - Zip contents of package folder.
 - Deploy with aws cli. Example: `aws lambda update-function-code --function-name "sms-notifier-lambda" --zip-file "fileb://lambda.zip"`
