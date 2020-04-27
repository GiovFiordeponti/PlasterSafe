# PlasterTalk Architecture
This section  contains references on the architecture used for this project, along with details on how the various technologies interact between each other.
## Overview
The main components of *PlasterTalk* can be seen on the image below:
![General Overview](images/Smart%20Museum.jpg)
As we can see:
* The cloud infrastructure will be build on [AWS](https://aws.amazon.com/it/console/), in particular we will use the following services provided by the platform:
  * IoT Core: service that gives us the opportunity to create a broker for each statue
  * DynamoDb: NoSql database that gives us the opportunity to store data from the statues and the overall application
  * Elastic Beanstalk: web container that will host Web-APi services for the *mobile appplication*/*web client*. Also, it will run a gateway between both *IoTCore broker* and *TTN broker* (see next point) 
* The statues need to be registered to The [Things Network](), a decentralized LoRaWAN infrastructure that will give us an easy way to register, manage and use things.
* Each room of the museum will display statues where a board will be placed on the support surface. In particular this board needs to satisfy the following requirements:
  * run an instance of RIOT-OS
  * LoRaWAN technology support
  * gyroscope and accelerometer sensors
 
  The main goals of the application running on the board will be:
  * retrieve room location from AWS 
  * keep track of the statue's movements and send gyroscope/accelerometer measures through the network
  
