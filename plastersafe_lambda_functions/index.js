console.log('function starts');
const AWS = require('aws-sdk');
const PlasterSafe = require('./lib');
console.log(PlasterSafe);
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});


exports.handler = function(event, context, callback){
    console.log('processing event: %j', event);
    let plasterSafe = new PlasterSafe();
    let message = JSON.parse(event.body);
    
    let params = message.action=="status" ? {
        TableName: "plastersafe_"+message.action
    } : {
        TableName: "plastersafe_"+message.action,
        FilterExpression: "#id = :id and #ts between :ts1 and :ts2 ",
        ExpressionAttributeNames:{
            "#ts": "ts",
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":ts1": message.ts1,
            ":ts2": message.ts2,
            ":id": message.id
        }
    };
    
    
    console.log("Scanning Ddb with parameters: %o", params);
    
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("error: %s", err);
            callback(null, {"statusCode": 500, "body": {error: "Internal error."}});
        } 
        else {
            data && data.Items && data.Items.forEach(function(item){
                plasterSafe.itemCallback(message.action, item);
                
            });
            
            callback(null, {"statusCode": 200, "body": JSON.stringify({data: plasterSafe.getPlasters(), action: message.action})});
        }
    });
};
    
