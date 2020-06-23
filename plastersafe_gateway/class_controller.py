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
        self.myMQTTClient.configureOfflinePublishQueueing(-1)
        self.myMQTTClient.configureDrainingFrequency(2)
        self.myMQTTClient.configureConnectDisconnectTimeout(10)
        self.myMQTTClient.configureMQTTOperationTimeout(5)
        # connection
        self.myMQTTClient.connect()
        print("Connected to Aws!")

    # publication on the topic
    def publish(self, topic, data):
        # publish the message forwarded by broker
        self.myMQTTClient.publish(topic, data, 0)
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
