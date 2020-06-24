var endpoint = "https://aoclety08l.execute-api.us-east-1.amazonaws.com/plastersafe"
var statues = {};
var auth = null;
var selectedItem = null;

function sendRequest(request, callback) {
    let oReq = new XMLHttpRequest();
    oReq.open("POST", endpoint);
    oReq.onload = callback;
    //Send the proper header information along with the request

    oReq.setRequestHeader("Content-Type", "text/plain");
    let body = JSON.stringify(request);
    console.log("sending %s", body);
    oReq.send(body);
}

function sessionCallback(item) {
    console.log("selected item %s", item);
    selectedItem = item;
    document.getElementById("download").disabled = false;
    let statue = item.split("_")[0];
    let index = item.split("_")[1];
    console.log("selecting statue %s start %s from statues %o", statue, index, statues);
    let session = statues[statue].sessions[index];
    console.log("session %o", session);
    if (session) {
        document.getElementById("selected").innerHTML = "Selected "+statue+" ["+new Date(Number(session.start)).toLocaleString()+" - "+new Date(Number(session.stop)).toLocaleString()+"]";
        sendRequest({ action: "temp", id: statue, ts1: Number(session.start), ts2: Number(session.stop) }, dataCallback);
        sendRequest({ action: "sma", id: statue, ts1: Number(session.start), ts2: Number(session.stop) }, dataCallback);
        sendRequest({ action: "acc", id: statue, ts1: Number(session.start), ts2: Number(session.stop) }, dataCallback);
        sendRequest({ action: "thresh", id: statue, ts1: Number(session.start), ts2: Number(session.stop) }, dataCallback);
        sendRequest({ action: "err", id: statue, ts1: Number(session.start), ts2: Number(session.stop) }, dataCallback);
    }
}

function dataCallback() {
    let payload = JSON.parse(this.responseText);
    console.log("payload is %o", payload);
    sampleCallback(payload.data, payload.action);
    Object.keys(payload.data).forEach(statue => {
        statues[statue][payload.action] = payload.data[statue];
    })
    console.log("statues are %o", statues);
}

function statusCallback() {
    let payload = JSON.parse(this.responseText).data;
    console.log("payload is %o", payload);
    Object.keys(payload).forEach(statue => {
        if (statues[statue] == null) {
            statues[statue] = {};
        }
        statues[statue]["sessions"] = [];
        Object.keys(payload[statue]).sort().forEach((session, index) => {
            let statueSession = { start: session, stop: payload[statue][session] };
            if (statueSession.stop == 0) {
                statueSession.stop = Date.now();
            }
            let startDate = new Date(Number(statueSession.start));
            let endDate = new Date(Number(statueSession.stop));
            statues[statue]["sessions"].push(statueSession);
            createRadio(document.getElementById("sessionDiv"), statue + "_" + index, "session", statue + "_" + index, statue + " [" + startDate.toLocaleString() + " - " + endDate.toLocaleString() + "]", (value) => { sessionCallback(value) })
        })
    })
    console.log("statue is %o", statues);
}

function refresh() {
    clearAnalytics();
    sendRequest({ action: "status" }, statusCallback);
}

function csvDownload() {
    console.log("selected item %s", selectedItem);
    let statue = selectedItem.split("_")[0];
    let index = selectedItem.split("_")[1];
    console.log("selecting statue %s start %s from statues %o", statue, index, statues);
    let session = statues[statue].sessions[index];
    console.log("session %o", session);
    if (session) {
        let csv = "data:text/csv;charset=utf-8,";
        Object.keys(statues[statue]).forEach((item, indexItem) => {
            if (item != "sessions") {
                let field = statues[statue][item];
                console.log("field %o", field);
                Object.keys(field).sort().forEach((fieldItem, fieldIndex) => {
                    console.log(fieldItem);
                    let value = isNaN(field[fieldItem]) ? JSON.stringify(field[fieldItem]).replace(",", " ") : field[fieldItem].toFixed(3);
                    if(item == "err"){
                        value = "last message at "+new Date(Number(field[fieldItem])).toLocaleString();
                    }
                    csv += item + ";" + new Date(Number(fieldItem)).toLocaleString() + ";" + value + (item == "acc" ? "g" : (item == "sma" ? "g" : (item=="temp" ? " celsius" : "")));
                    if (fieldIndex + 1 != Object.keys(field).length || indexItem + 1 != Object.keys(statues[statue]).length) {
                        csv += "\r\n";
                    }
                })
            }
        })
        let encodedUri = encodeURI(csv);
        let link = document.getElementById("downloadLink");
        //link.hidden = false;
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", selectedItem+".csv");
        link.innerHTML = selectedItem+".csv";
        link.click(); // This will download the data file named "my_data.csv".
    }
}


window.onload = function () {
    this.statues = {};

    auth = localStorage.getItem("CognitoIdentityServiceProvider.3idm7f4rpmg218rrpu3drarnjj.LastAuthUser");

    if (auth != null) {
        document.getElementById("download").disabled = true;
        document.getElementById("page").hidden = false;
        document.getElementById("userId").innerHTML = auth;  
        sendRequest({ action: "status" }, statusCallback);
    }
    else {
        window.history.back();
    }
}


