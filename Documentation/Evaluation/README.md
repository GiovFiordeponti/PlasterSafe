# PlasterSafe Evaluation
The evaluations will be made from the user's point of view and from a technical point of view.

## User:
Following the conference with the director of the *Museo dell'Arte Classica - Sapienza* we collected the information necessary to develop a security system for moving statues outside the museum. So our project is to monitor the statues during transport from one museum to another, from one exhibition to another. Two types of museum workers will use our application, the archivist and the courier. 
* The archivist will be able to manage the transport of the statues safely having the possibility to monitor the statues both during transport and during the exhibition;

* The courier will be able to transport the statues safely by having real-time notifications of any situations harmful to the statues.

At the end of each transport it is possible to download a report, in *CSV format*, with all the details of the transport.

## Software:
The heart of our application is in the Riot-OS system firmware. This firmware can be loaded onto any board capable of running the Riot-OS system. In our project we used a Board STM32 Nucleo to which a gyroscope was connected, for calculating the movements on each axis, and a temperature and humidity sensor, able to monitor the environment in which it resides.

* The firmware developed has the ability to read the data from the sensors and send them to the Gateway. Not having all the components available, the connection with the Gateway was made via the Serial port. Because the accelerometer is connected to the STM32 with a breadboard, sometimes disconnection may happen. Also, it was tested with the shortest range of supported accelerations, since there was not the opportunity to test it on a real case situation. The integrated thermometer within the accelerometer works fine since temperature does not change drastically over short periods. However, sometimes it may happen that wrong values are being reported by the sensor: because it was one of the cheapest available, we may consider using a more valuable sensor for other real-case tests,

* The gateway is represented by a Raspberry Pi 3, which via a Python script acts as a *transparent bridge*. After receiving the data from the boards attached to the statues, which may be more than one, the Gateway processes them and after analyzing the data it is able to assess whether the statue is in a dangerous situation. In the event of a dangerous situation, an alert is raised on the mobile application in order to promptly notify the courier. The processed data is sent to the Cloud, in this way even the archivist is able to always check the status of the statues. 

* The efficiency of the system was assessed by calculating the latency times on the alerts. Given the following Internet connection for the gateway:

  ```
  Download: 6.15 Mbps
  Upload: 1.25 Mbps
  Latency: 85 ms
  ```
  we achieved the following results with a 5 minute session running two emulated boards within the gateway:
  ```
  Statistics from statue statue-emulated-1:
  Running time: 356989 ms, Messages sent: 20, Received: 20, Min: 179 ms, Max: 12496 ms; AVG: 1135 ms

  Statistics from statue statue-emulated-2:
  Running time: 351988 ms, Messages sent: 24, Received: 24, Min: 190 ms, Max: 7805 ms; AVG: 1302 ms
  ```
  The times may change due to network loss, but the final result given by the tests are good: in case of danger our system is able to raise an alert with an average time of one second.
