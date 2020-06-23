class IoTCore {

    /**
     * 
     * @param {*} principal 
     * @param {*} messageCallback 
     */
    constructor(principal, messageCallback) {
        //Attach pre-created IoT policy to this principal. 
        //IMPORTANT: Make sure you have granted AttachPrincipalPolicy API permission in IAM to Cognito Identity Pool's Role.
        //It is done here for the demo purpose only while cognito user should NOT be allowed to call AttachPrincipalPolicy in production, this step must be done by Administrator only
        this.attachPrincipalPolicy("plastersafe_policy", principal);
        //Now we can use this principal for IoT actions
        //We'll need aws-iot-device-sdk-js for mqtt over websocket calls using these cognito credentials.
        let clientID = 'webapp:' + Date.now(); //needs to be unique
        this.options = {
            clientId: clientID,
            host: 'a91timt1kp7il-ats.iot.us-east-1.amazonaws.com', //can be queried using 'aws iot describe-endpoint'
            protocol: 'wss',
            accessKeyId: AWS.config.credentials.accessKeyId,
            secretKey: AWS.config.credentials.secretAccessKey,
            sessionToken: AWS.config.credentials.sessionToken
        };

        this.device = AwsIot.device(this.options);

        this.device.on('connect', (function () {
            //this.publishMessage("appTopic", "ciao");
            console.log("connected");
        }).bind(this));

        this.device.on('error', function (err) {
            console.error("err %o", err);
        });

        this.device.on('message', function(topic, payload) {
            console.log("message ",topic, payload.toString());
            messageCallback(topic, JSON.parse(payload.toString()));
        });

    }

    /**
     * 
     * @param {*} topic 
     * @param {*} msg 
     */
    publish(topic, msg) {
        console.log("publishing msg %s on topic %s", msg, topic);
        this.device.publish(topic, msg, {}, (function (err, resp) {
            if (err) {
                console.error("failed to publish iot message! %o", err);
            } else {
                console.log("published to "+topic);
            }
        }).bind(this));
    }

    /**
     * 
     * @param {*} policyName 
     * @param {*} principal 
     */
    attachPrincipalPolicy(policyName, principal) {
        new AWS.Iot().attachPrincipalPolicy({ policyName: policyName, principal: principal }, function (err, data) {
            if (err) {
                console.error(err); // an error occurred
            }
        });
    }

    /**
     * 
     * @param {*} topic 
     */
    subscribe(topic){
        this.device.subscribe(topic);
        console.log("subscription to topic %s done", topic);
    }
}