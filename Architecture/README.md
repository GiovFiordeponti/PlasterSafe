# PlasterTalk Architecture
This section  contains references on the architecture used for this project, along with details on how the various technologies interact between each other.
## Overview
The main components of *PlasterTalk* can be seen on the image below:
![General Overview](images/architecture.jpg)
As we can see:
* The cloud infrastructure will be build on [AWS](https://aws.amazon.com/it/console/), in particular we will use the following services provided by the platform:
  * IoT Core: service that gives us the opportunity to create a broker for each statue,
  * DynamoDb: NoSql database that gives us the opportunity to store data from the statues and the overall application,
  * Elastic Beanstalk: web container that will host Web-APi services for the *mobile appplication*/*web client*. Also, it will receive data from the *IoTCore MQTT broker*.
* The statues need to be connected to a local *MQTT-SN broker*, which comes with a gateway that sends data to AWS through an MQTT connection.
* Each room of the museum will display statues where a board will be placed on the support surface. We will take as a reference an [STM 32 Nucleo Board](https://www.st.com/en/evaluation-tools/stm32-nucleo-boards.html), but any board that has the following characteristics can be used:
  * run an instance of [RIOT-OS](https://github.com/RIOT-OS/RIOT),
  * *MQTT-SN* technology support,
  * gyroscope, accelerometer and proximity sensors.
  
  The main goals of the application running on the board will be:
  * retrieve room location from AWS and statue current status (locked/unlocked). The status will change the message frequency,
  * keep track of the statue's movements and send gyroscope/accelerometer measures through the network.
* Each room of the museum will be equipped with an [Estimote proximity sensor](https://developer.estimote.com/), that will be recognized by mobile application of visitors thanks to a Bluetooth communication. 

In the end three end-user applications will interact with this system. This three applications consists of:
* A mobile application developed with Android Studio which will give to the user the possibility to see the information about near-by station, by using Bluetooth technology in order to gather the location of the current room from the nearest beacon. The user can also leave feedbacks, in order to improve the overall presentation of the museum. This values will be retrieved from the *Elastic Beanstalk Web API* using REST calls.
* A mobile application developed with Android Studio which will give to maintenance and security staff to see if:
  * some statues are subject to extraneous movements,
  * control the movements of the statue while moving.
  This values will be retrieved from the *Elastic Beanstalk Web API* using a WebSocket
  
  These task can be done by retrieving the statues measurements from the cloud
* A web application will be used by curators and archivists of the museum in order to have a general overview of the museum and be able to do the following task:
  * assign a statue to a given room covered by one of the proximity beacons,
  * assign information to a given statue and see the relative feedback by the user,
  * unlock a statue in order to change its location within the museum.
  This operations will be done by interacting with the *Elastic Beanstalk Web API* using REST calls.
