window.onload = function () {
    this.statues = {};
    const DEFAULT_TOPIC = "plasterTopic";
    this.topicList = [DEFAULT_TOPIC + "/status", DEFAULT_TOPIC + "/sma", DEFAULT_TOPIC + "/acc", DEFAULT_TOPIC + "/temp", DEFAULT_TOPIC + "/thresh"];
    this.selectedStatue = null;
    this.notificationCount = 0;
    this.cognito = new Cognito(authCallback.bind(this));
    this.auth = this.cognito.getAuth();
    cognito.parseCognitoWebResponse(window.location.href);

    addSignInFunction(userAction.bind(this));
}

function userAction() {
    if (getUserState()) {
        this.auth.signOut();
        showSignedOut();
    } else {
        this.auth.getSession();
    }
}

function authCallback(result) {
    //alert("Sign in success");
    console.log("result: %o", result);
    showSignedIn(result);
    let loginKey = 'cognito-idp.' + AWS.config.region + '.amazonaws.com/' + this.cognito.getAuthData()['UserPoolId'];
    let login = {};

    login[loginKey] = result.getIdToken().getJwtToken();

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
        Logins: login
    });
    AWS.config.credentials.refresh(((error) => {
        if (error) {
            console.error(error);
        } else {
            setUser(this.auth.username);
            localStorage.setItem("auth", JSON.stringify(this.auth));
            let principal = AWS.config.credentials.identityId;
            console.log("IdentityId: " + principal);

            //Now we have cognito identity and credentials to make AWS IoT calls.
            this.IoT = new IoTCore(principal, plasterMessageCallback.bind(this));

            this.topicList.forEach(topic => {
                this.IoT.subscribe(topic);
            })
        }
    }).bind(this));
}

function plasterMessageCallback(topic, payload) {

    if (payload.id && !this.statues[payload.id]) {
        this.statues[payload.id] = { temp: { value: "ok", ts: 0 }, sma: { value: "ok", ts: 0 }, acc: { value: { acc_x: "ok", acc_y: "ok", acc_z: "ok" }, ts: 0 }, thresh: {} };
        addStatue(payload.id, plasterCallback.bind(this));
    }

    let statue = this.statues[payload.id];

    switch (topic) {
        case this.topicList[3]:
            statue.temp.value = payload.value;
            statue.temp.ts = payload.ts;
            break;
        case this.topicList[2]:
            statue.acc.value = payload.value;
            statue.acc.ts = payload.ts;
            break;
        case this.topicList[1]:
            statue.sma.value = payload.value;
            statue.sma.ts = payload.ts;
            break;
        case this.topicList[0]:
            if (payload.threshold) {
                if (statue.thresh && this.selectedStatue == payload.id) {
                    // update threshold on page if needed
                    let actualThresh = statue.thresh;
                    let newThresh = payload.threshold;
                    if (actualThresh.acc_thresh != newThresh.acc_thresh || actualThresh.temp_max_thresh != newThresh.temp_max_thresh || actualThresh.temp_min_thresh != newThresh.temp_min_thresh || actualThresh.sma_thresh != newThresh.sma_thresh) {
                        setSliders(this.selectedStatue, sliderCallback.bind(this), newThresh); // if some value is different from one of the values displayed on page, update it
                    }
                }
                statue["thresh"] = {
                    "acc_thresh": payload.threshold.acc_thresh,
                    "temp_max_thresh": payload.threshold.temp_max_thresh,
                    "temp_min_thresh": payload.threshold.temp_min_thresh,
                    "sma_thresh": payload.threshold.sma_thresh
                }
            }
            break;
        case this.topicList[4]:
            Object.keys(payload).forEach(key => {
                if (key != "id" && key != "ts") {
                    statue["thresh"][key] = payload[key];
                    console.log("thresh %s updated with value %s", key, payload[key]);
                    payload.value = { key: key, value: payload[key] };
                }
            })
            break;
        default:
            console.warn("topic not recognized");
            break;

    }
    statue.ts = payload.ts;

    if (this.selectedStatue == payload.id && topic != this.topicList[0]) {
        showMeasures(statue.acc, statue.temp, statue.sma);
    }
    let notification = createNotificationObject(topic, payload.id, payload.value, new Date(payload.ts));
    if (notification != null) {
        this.notificationCount++;
        updateNotificationCount(this.notificationCount);
        showNotification(notification);
    }
}

function plasterCallback(id) {
    let statue = this.statues[id];
    this.selectedStatue = id;
    showMeasures(statue.acc, statue.temp, statue.sma);
    setSliders(this.selectedStatue, sliderCallback.bind(this), statue.thresh);
}

function sliderCallback(id, thresh, domElement) {
    document.getElementById(domElement).innerHTML = thresh;
    let thresId = domElement.split("_")[0]+"_"+domElement.split("_")[1];
    let payload = {};
    payload["id"] = id;
    payload["ts"] = Date.now();
    payload[thresId] = thresh;
    //callback(payload);
    this.IoT.publish("plasterTopic/thresh", JSON.stringify(payload));
}

function createNotificationObject(topic, id, value, date) {
    switch (topic) {
        case this.topicList[3]:
            return {
                title: "Temperature alert from " + id,
                body: value.toFixed(2) + "° [" + date.toLocaleString() + "]",
                icon: "../img/" + topic.replace("/", "-") + ".png"
            };
        case this.topicList[2]:
            let body = "[";
            Object.keys(value).forEach((axis, index) => {
                if (value[axis] != "ok") {
                    if (body != "[") {
                        body += ", ";
                    }
                    body += axis.split("_")[1] + "=" + value[axis].toFixed(2) + "g";

                }
            })
            body += "]";
            return {
                title: "Acceleration alert from " + id,
                body: body + " [" + date.toLocaleString() + "]",
                icon: "../img/" + topic.replace("/", "-") + ".png"
            };
        case this.topicList[1]:
            return {
                title: "SMA alert from " + id,
                body: value.toFixed(2) + "dB [" + date.toLocaleString() + "]",
                icon: "../img/" + topic.replace("/", "-") + ".png"
            };
        case this.topicList[0]:
            if (value == "start" || value == "stop") {
                return {
                    title: "Statue " + id + " tracking " + (value == "start" ? "started" : "stopped"),
                    body: "[" + date.toLocaleString() + "]",
                    icon: "../img/" + topic.replace("/", "-") + "-" + value + ".png"
                };
            }
            else {
                return null;
            }
        case this.topicList[4]:
            return {
                title: "Statue " + id + " new value " + value.value + " for threshold " + value.key,
                body: "[" + date.toLocaleString() + "]",
                icon: "../img/" + topic.replace("/", "-") + ".png"
            };
        default:
            console.warn("topic not recognized");
            return null;
    }
}

