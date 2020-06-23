import serial
from numpy import interp

try:
	port = serial.Serial("/dev/ttyACM0", baudrate=115200, timeout=1.0)

	cloud_measures = dict()

	while True:
		msg = port.readline().decode('ISO-8859-1')
		print("received msg "+msg)
		if msg != "":
			measures = msg.split()
			if len(measures) == 4:
				cloud_measures["acc_x"] = interp(float(measures[0]), [0, 255], [-2, 2])
				cloud_measures["acc_y"] = interp(float(measures[1]), [0, 255], [-2, 2])
				cloud_measures["acc_z"] = interp(float(measures[2]), [0, 255], [-2, 2])
				cloud_measures["temp"] = interp(float(measures[0]), [0, 4095], [0, 85])
				print(cloud_measures)

except OSError as e:
	print('no board connected to serial interface')
