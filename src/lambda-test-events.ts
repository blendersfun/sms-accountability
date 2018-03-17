
const cloudwatchEventWithoutTime = {
    version: '0',
    id: 'a9e5e782-d420-7516-c196-3adbe131c79c',
    'detail-type': 'Scheduled Event',
    source: 'aws.events',
    account: '801426893453',
    time: null,
    region: 'us-west-2',
    resources: [ 'arn:aws:events:us-west-2:801426893453:rule/run_at_noon_pst_or_pdt' ],
    detail: {}
};

export const cloudwatchEventMarchNoonPDT = Object.assign({}, cloudwatchEventWithoutTime, {
    time: '2018-03-15T19:00:00Z'
});

export const cloudwatchEventDecemberNoonPDT = Object.assign({}, cloudwatchEventWithoutTime, {
    time: '2018-12-15T19:00:00Z'
});

export const cloudwatchEventDecemberNoonPST = Object.assign({}, cloudwatchEventWithoutTime, {
    time: '2018-12-15T20:00:00Z'
});

export const cloudwatchEventMarchNoonPST = Object.assign({}, cloudwatchEventWithoutTime, {
    time: '2018-03-15T20:00:00Z'
});

export const twilioGatewayEvent = {
    resource: '/sms-notifier-lambda',
    path: '/sms-notifier-lambda',
    httpMethod: 'POST',
    headers: {
        Accept: '*/*',
        'Cache-Control': 'max-age=259200',
        'CloudFront-Forwarded-Proto': 'https',
        'CloudFront-Is-Desktop-Viewer': 'true',
        'CloudFront-Is-Mobile-Viewer': 'false',
        'CloudFront-Is-SmartTV-Viewer': 'false',
        'CloudFront-Is-Tablet-Viewer': 'false',
        'CloudFront-Viewer-Country': 'US',
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'dwgtpve36e.execute-api.us-west-2.amazonaws.com',
        'User-Agent': 'TwilioProxy/1.1',
        Via: '1.1 6e87fc252a6864b85b4d1f260faac78f.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Id': '6Ufy44byCJ61rqU7jUyXftvB2b2EBEB1abBlOXnnznhR6uiqaG_nMQ==',
        'X-Amzn-Trace-Id': 'Root=1-5aabffa2-79569418085a06686f9a08a0',
        'X-Forwarded-For': '52.202.224.32, 54.240.144.56',
        'X-Forwarded-Port': '443',
        'X-Forwarded-Proto': 'https',
        'X-Twilio-Signature': 'lnk/+Vcz7l0Zx8w+34qEDm8zr/I='
    },
    queryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
        requestTime: '16/Mar/2018:17:32:18 +0000',
        path: '/production/sms-notifier-lambda',
        accountId: '801426893453',
        protocol: 'HTTP/1.1',
        resourceId: 'qiv4u9',
        stage: 'production',
        requestTimeEpoch: 1521221538163,
        requestId: 'f992dc48-293f-11e8-aa48-b7411dc1e21c',
        identity: {
            cognitoIdentityPoolId: null,
            accountId: null,
            cognitoIdentityId: null,
            caller: null,
            sourceIp: '52.202.224.32',
            accessKey: null,
            cognitoAuthenticationType: null,
            cognitoAuthenticationProvider: null,
            userArn: null,
            userAgent: 'TwilioProxy/1.1',
            user: null
        },
        resourcePath: '/sms-notifier-lambda',
        httpMethod: 'POST',
        apiId: 'dwgtpve36e'
    },
    body: 'ToCountry=US&ToState=OR&SmsMessageSid=SMab830e79a227bff40b80cc4bf43d7ebc&NumMedia=0&ToCity=CHARBONNEAU&FromZip=97224&SmsSid=SMab830e79a227bff40b80cc4bf43d7ebc&FromState=OR&SmsStatus=received&FromCity=TIGARD&Body=E&FromCountry=US&To=%2B15036943429&ToZip=97070&NumSegments=1&MessageSid=SMab830e79a227bff40b80cc4bf43d7ebc&AccountSid=FAKE-ACCOUNT-SID&From=%2B15034533916&ApiVersion=2010-04-01',
    isBase64Encoded: false
};
