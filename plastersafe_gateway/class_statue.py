import random


class Statue:

    def __init__(self, statue_id):
        self.id = statue_id
        self.temperature = 0
        self.accelerometer_x = 0
        self.accelerometer_y = 0
        self.accelerometer_z = 0

    # update the sensor data with random values
    def updateData(self):
        self.temperature = random.randint(0, 4095)
        self.accelerometer_x = random.randint(0, 200)
        self.accelerometer_y = random.randint(0, 200)
        self.accelerometer_z = random.randint(0, 200)

    # return the data in a json _dict_
    def getData(self):
        msg = str(self.accelerometer_x)+" "+str(self.accelerometer_y)+" "+str(self.accelerometer_z)+" "+str(self.temperature)
        print("statue "+self.id+" measures: "+msg)
        return msg+" "+str(self.id)