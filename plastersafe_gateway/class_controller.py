from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient


class Controller:
    def __init__(self, id_client):
        self.id_client = id_client
        self.myMQTTClient = None

    # connection to Aws Iot
    def awsConnect(self):
        # statue_client -> id_client
        # simulated_data -> topic
        self.myMQTTClient = AWSIoTMQTTClient(self.id_client)
        # endpoint and port
        self.myMQTTClient.configureEndpoint(
            "a91timt1kp7il-ats.iot.us-east-1.amazonaws.com", 8883)
        # certificates of thing
        self.myMQTTClient.configureCredentials("./cert/root-CA.crt",
                                               "./cert/private.pem.key",
                                               "./cert/certificate.pem.crt")
        
        # Configure the offline queue for publish requests to be 500 in size
        self.myMQTTClient.configureOfflinePublishQueueing(500)
        self.myMQTTClient.configureDrainingFrequency(2)
        # Configure connect/disconnect timeout to be 10 seconds
        self.myMQTTClient.configureConnectDisconnectTimeout(10)
        # Configure the auto-reconnect backoff to start with 1 second and use 128 seconds as a maximum back off time.
        # Connection over 20 seconds is considered stable and will reset the back off time back to its base.
        self.myMQTTClient.configureAutoReconnectBackoffTime(1, 128, 20)
        # Configure MQTT operation timeout to be 500 seconds
        self.myMQTTClient.configureMQTTOperationTimeout(500)
        # connection
        self.myMQTTClient.connect()
        print("Connected to Aws!")

    # publication on the topic
    def publish(self, topic, data):
        # publish the message forwarded by broker
        self.myMQTTClient.publishAsync(topic, data, 1)
        print('Published topic -> %s: %s' % (topic, data))

    def subscribe(self, topic, callback):
        self.myMQTTClient.subscribe(topic, 1, callback)
        print('Subscription to topic %s done.' % (topic))

    def unsubscribe(self, topic):
        self.myMQTTClient.unsubscribe(topic)
        print('Unsubscription to topic %s done.' % (topic))

    def disconnect(self):
        print("Discnnected from Aws!")
        self.myMQTTClient.disconnect()
