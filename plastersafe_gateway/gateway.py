import paho.mqtt.client as mqtt
from class_controller import Controller
from class_statue import Statue
from numpy import interp
from threading import Thread
import sys
import os
import time
import serial
import json
import ast

# variabili per elaborazione dati
samples = dict()
threshold_acc = 1.5
threshold_temp_max = 25
threshold_temp_min = 20
threshold_sma = 2.5

PLASTERSAFE_TOPIC = "plasterTopic"
STATUS_TOPIC = PLASTERSAFE_TOPIC+"/status"
ACC_TOPIC = PLASTERSAFE_TOPIC+"/acc"
SMA_TOPIC = PLASTERSAFE_TOPIC+"/sma"
TEMP_TOPIC = PLASTERSAFE_TOPIC+"/temp"
THRESH_TOPIC = PLASTERSAFE_TOPIC+"/thresh"
ERROR_TOPIC = PLASTERSAFE_TOPIC+"/err"

THREAD_1_SLEEP_SECONDS = 1
THREAD_2_SLEEP_SECONDS = 10


def map_digital_values(acc_x, acc_y, acc_z, temp):
    analog_acc_x = interp(float(acc_x), [0, 255], [-2, 2])
    analog_acc_y = interp(float(acc_y), [0, 255], [-2, 2])
    analog_acc_z = interp(float(acc_z), [0, 255], [-2, 2])
    analog_temp = interp(float(temp), [0, 4095], [0, 85])

    return [analog_acc_x, analog_acc_y, analog_acc_z, analog_temp]

def get_current_ts():
    return int(time.time()*1000.0)

def send_measures_to_aws(x_discrete, y_discrete, z_discrete, temp, statue_id):
    # map values from digital to analog
    acc_x, acc_y, acc_z, temp = map_digital_values(
        x_discrete, y_discrete, z_discrete, temp)
    # if it's first time for the statue, initialize it
    if statue_id not in samples:
        current_ts = get_current_ts()
        samples[statue_id] = {
            "count": 0,
            "x": 0,
            "y": 0,
            "z": 0,
            "acc_thresh": threshold_acc,
            "sma_thresh": threshold_sma,
            "temp_max_thresh": threshold_temp_max,
            "temp_min_thresh": threshold_temp_min,
            "started": current_ts,
            "last": current_ts, # last message sent
            "sent": 0 # message check for latency
        }

        msg = {
            "ts": current_ts,
            "id": statue_id,
            "value": "start",
            "threshold": {
                "acc_thresh": samples[statue_id]["acc_thresh"],
                "sma_thresh": samples[statue_id]["sma_thresh"],
                "temp_max_thresh": samples[statue_id]["temp_max_thresh"],
                "temp_min_thresh": samples[statue_id]["temp_min_thresh"]
            }
        }
        print("forwarding alert to aws - Start tracking ...")
        controller.publish(STATUS_TOPIC, json.dumps(msg))
        samples[statue_id]["sent"] += 1

    # store samples in the id dict
    if samples[statue_id]["count"] < 10:
        samples[statue_id]["count"] += 1
        # store to previous values
        samples[statue_id]["x"] += acc_x
        samples[statue_id]["y"] += acc_y
        samples[statue_id]["z"] += acc_z

        ###############################
        #    Sensor measures check    #
        ###############################

        # acc threshold check
        if acc_x > samples[statue_id]["acc_thresh"] or acc_y > samples[statue_id]["acc_thresh"] or acc_z > samples[statue_id]["acc_thresh"]:
            # lambda function to send alert only to corresponding axis
            def alert(x): return x if (
                x > samples[statue_id]["acc_thresh"]) else "ok"
            current_ts = get_current_ts()
            msg = {
                "ts": current_ts,
                "id": statue_id,
                "value": {
                    "acc_x": alert(acc_x),
                    "acc_y": alert(acc_y),
                    "acc_z": alert(acc_z)
                }
            }
            samples[statue_id]["last"] = current_ts
            print("forwarding alert to aws - Dangerous vibrations for the statue ...")
            controller.publish(ACC_TOPIC, json.dumps(msg))
            samples[statue_id]["sent"] += 1

        # temp check
        if temp > samples[statue_id]["temp_max_thresh"] or temp < samples[statue_id]["temp_min_thresh"]:
            # send alert to cloud
            current_ts = get_current_ts()
            msg = {
                "ts": current_ts,
                "id": statue_id,
                "value": temp
            }
            samples[statue_id]["last"] = current_ts
            print("forwarding alert to aws - Dangerous environment values ...")
            controller.publish(TEMP_TOPIC, json.dumps(msg))
            samples[statue_id]["sent"] += 1

    if samples[statue_id]["count"] == 10:
        # compute SMA
        sma = (abs(samples[statue_id]["x"]) + abs(samples[statue_id]["y"]
                                                  ) + abs(samples[statue_id]["z"]))/samples[statue_id]["count"]
        current_ts = get_current_ts()

        ###############################
        #    Sensor measures check    #
        ###############################

        if sma > samples[statue_id]["sma_thresh"]:
            # Invio un alert al cloud
            msg = {
                "ts": current_ts,
                "id": statue_id,
                "value": sma
            }
            print("forwarding alert to aws - SMA values beyond the threshold ...")
            controller.publish(SMA_TOPIC, json.dumps(msg))
            samples[statue_id]["sent"] += 1

        # send thresh only to cloud if everything is normal
        else:
            msg = {
                "ts": current_ts,
                "id": statue_id,
                "value": "OK",
                "threshold": {
                    "acc_thresh": samples[statue_id]["acc_thresh"],
                    "sma_thresh": samples[statue_id]["sma_thresh"],
                    "temp_max_thresh": samples[statue_id]["temp_max_thresh"],
                    "temp_min_thresh": samples[statue_id]["temp_min_thresh"]
                }
            }
            print("forwarding alert to aws - Everything is normal ...")
            controller.publish(STATUS_TOPIC, json.dumps(msg))
            samples[statue_id]["sent"] += 1
        # Restart sample count
        samples[statue_id]["last"] = current_ts
        samples[statue_id]["count"] = 0
        samples[statue_id]["x"] = 0
        samples[statue_id]["y"] = 0
        samples[statue_id]["z"] = 0
    sys.stdout.flush()

# callback for message send by broker


def on_message(client, userdata, message):
    # message is in the form <acc_x> <acc_y> <acc_z> <temp> <id>
    data = message.payload.decode("utf-8").split()
    print("message received --> " + data)
    if len(data) == 4:
        statue_id = data[4]
        acc_x = int(data[0])
        acc_y = int(data[1])
        acc_z = int(data[2])
        temp = int(data[3])

        send_measures_to_aws(acc_x, acc_y, acc_z, temp, statue_id)
    else:
        print(
            "invalid message provided. must be of the form <accx> <accy> <accz> <temp> <id>")


def threshold_callback(client, userdata, message):
    payload = eval(message.payload)  # parse json string to dict
    statue_id = payload["id"]
    statue = samples[statue_id]

    if "acc_thresh" in payload:
        statue["acc_thresh"] = float(payload["acc_thresh"])
        print("changed acc_thresh in "+payload["acc_thresh"]+" for statue "+statue_id)
    elif "temp_max_thresh" in payload:
        statue["temp_max_thresh"] = int(payload["temp_max_thresh"])
        print("changed temp_max_thresh in "+payload["temp_max_thresh"]+" for statue "+statue_id)
    elif "temp_min_thresh" in payload:
        statue["temp_min_thresh"] = int(payload["temp_min_thresh"])
        print("changed temp_min_thresh in "+payload["temp_min_thresh"]+" for statue "+statue_id)
    elif "sma_thresh" in payload:
        statue["sma_thresh"] = float(payload["sma_thresh"])
        print("changed sma_thresh in "+payload["sma_thresh"]+" for statue "+statue_id)
    else:
        print("invalid message received")

def send_error(statue_id, current_ts, last_ts):
    msg = {
        "ts": current_ts,
        "id": statue_id,
        "value": last_ts
    }
    print("forwarding alert to aws - Statue %s not sending any message after a minute..." %(statue_id))
    controller.publish(ERROR_TOPIC, json.dumps(msg))
    samples[statue_id]["sent"] += 1

def check_if_statues_are_alive():
    while True:
        for statue_id in samples:
            current_ts = get_current_ts()
            if current_ts - samples[statue_id]["last"] > 1000 * 60:
                print("statue %s not responding"%(statue_id))
                send_error(statue_id, current_ts, samples[statue_id]["last"])
            else:
                print("statue %s is alive"%(statue_id))
        time.sleep(THREAD_2_SLEEP_SECONDS)

def mqttsn_mode(id_client, topic):
    client = mqtt.Client(id_client)
    client.on_message = on_message
    client.connect("localhost", 1886)
    print("Connected to Broker on port -> 1886")
    client.subscribe(topic)
    print("Subscribe to topic " + topic)
    client.loop_forever()


def serial_mode():
    try:
        port = serial.Serial("/dev/ttyACM0", baudrate=115200, timeout=THREAD_1_SLEEP_SECONDS)

        while True:
            msg = port.readline().decode('ISO-8859-1')
            print("received msg "+msg)
            if msg != "":
                measures = msg.split()
                if len(measures) == 4 and "0" not in measures:
                    send_measures_to_aws(
                        measures[0], measures[1], measures[2], measures[3], "serial-statue")
                
    except OSError:
        print('no board connected to serial interface')


def emulated_mode():
    # run emulated enivornment
    statues = dict()
    statues["statue-emulated-1"] = Statue("statue-emulated-1")
    statues["statue-emulated-2"] = Statue("statue-emulated-2")
    while True:
        for statue in statues:
            statues[statue].updateData()
            payload = statues[statue].getData().split()
            send_measures_to_aws(
                payload[0], payload[1], payload[2], payload[3], payload[4])
            # waiting between one publication and another
            time.sleep(THREAD_1_SLEEP_SECONDS)


if __name__ == "__main__":
    # we run two threads. one for handling errors (i.e. the statue is not responding), the other for sending measures 
    try:
        controller = Controller("statue_gateway")
        controller.awsConnect()
        controller.subscribe(THRESH_TOPIC, threshold_callback)
        # avvio connessione con il broker per ricevere dati dalla board
        if len(sys.argv) == 2:
            print("mode: "+sys.argv[1])
            thread1 = Thread(target = check_if_statues_are_alive) # first thread: check if statues are alive
            thread1.daemon = True
            thread1.start()
            thread2 = None
            if sys.argv[1] == "emulated":
                # run emulated mode
                thread2 = Thread(target = emulated_mode)
            elif sys.argv[1] == "serial":
                # run serial environment
                thread2 = Thread(target =  serial_mode)
            elif sys.argv[1] == "mqttsn":
                # run mqtt-sn gateway
                mqttsn_mode("client1", "data_read")
            else:
                print("invalid mode provided")
                sys.exit(0)
            thread2.daemon = True
            thread2.start() # second thread: retrieve data from each statues and sends to aws
            while True:
                time.sleep(1)
        else:
            print("Usage: python gateway.py <emulated|serial|mqttsn>")
            controller.unsubscribe(THRESH_TOPIC)
            controller.disconnect()
            sys.exit(0)
    except KeyboardInterrupt:
        print('Gateway Interrupted. Stop tracking for all statues')
        try:
            for statue_id in samples:
                # Invio un alert al cloud
                samples[statue_id]["sent"] += 1
                msg = {
                    "ts": get_current_ts(),
                    "started": samples[statue_id]["started"],
                    "id": statue_id,
                    "value": "stop",
                    "sent": samples[statue_id]["sent"]
                }
                print("forwarding alert(1111) to aws - Stop tracking ...")
                controller.publish(STATUS_TOPIC, json.dumps(msg))
            controller.unsubscribe(THRESH_TOPIC)
            controller.disconnect()
            sys.stdout.flush()
            sys.exit(0)
        except SystemExit:
            os._exit(0)
