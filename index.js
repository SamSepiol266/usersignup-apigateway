const AWS = require('aws-sdk');
AWS.config.update( {
    region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'newuserdb';
const healthPath = '/health';
const newusersPath = '/newusers';

exports.handler = async function(event) {
    console.log('Request event: ', event);
    let response;
    switch(true){
        case event.httpMethod === 'GET' && event.path === healthPath:
            response = buildResponse(200);
            break;
        case event.httpMethod === 'GET' && event.path === newusersPath:
            response = await getNewusers(event.queryStringParameters.newusersID);
            break;
        case event.httpMethod === 'POST' && event.path === newusersPath:
            response =  await createNewusers(JSON.parse(event.body));
            break;

    }
    return response;
}

async function getNewusers(emailaddress){
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'emailaddress': emailaddress
        }
    }
    return await dynamodb.get(params).promise().then((response) => {
        return buildResponse(200, response.Item);
    }, (error) => {
        console.error('Do your custom error handling here. I am just going to log it: ', error);
    });
}

async function createNewusers(requestBody) {
  const params = {
    TableName: dynamodbTableName,
    Item: requestBody
  }
  return await dynamodb.put(params).promise().then(() => {
    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
      Item: requestBody
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  })
}






function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body);
    }
}