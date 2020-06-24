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
        self.temperature = random.randint(1000, 1250)
        self.accelerometer_x = random.randint(180, 230)
        self.accelerometer_y = random.randint(180, 230)
        self.accelerometer_z = random.randint(180, 230)

    # return the data in a string of the form <acc_x> <acc_y> <acc_z> <temp> <id>
    def getData(self):
        msg = str(self.accelerometer_x)+" "+str(self.accelerometer_y)+" "+str(self.accelerometer_z)+" "+str(self.temperature)
        print("statue "+self.id+" measures: "+msg)
        return msg+" "+str(self.id)