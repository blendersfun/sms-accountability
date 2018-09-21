#!/bin/bash
rm -rf deploy
mkdir deploy

echo "Packing"
npm pack > /dev/null 2>&1

echo "Extracting to ./deploy"
ls sms-accountability* | xargs tar -C deploy/ -xvzf > /dev/null 2>&1
rm sms-accountability*

echo "Copying the secrets into the package"
cp -r config deploy/package/

echo "Zipping the package"
pushd deploy/package/ > /dev/null 2>&1
zip -r ../deploy.zip * > /dev/null 2>&1
popd > /dev/null 2>&1
rm -rf deploy/package/

echo "Deploying the package"
aws lambda update-function-code --function-name "sms-notifier-lambda" --zip-file "fileb://deploy/deploy.zip"