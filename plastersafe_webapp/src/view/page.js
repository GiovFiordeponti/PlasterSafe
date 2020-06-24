/**
 * 
 * @param {*} callback 
 */
function addSignInFunction(callback) {
    document.getElementById("signButton").addEventListener("click", callback);
}


/**
 * Operations when showing message.
 */
function showMeasures(acc, temperature, sma) {
    let accValue = acc.value;
    let accDate = acc.ts != 0 ? new Date(acc.ts) : new Date();
    let tempValue = temperature.value;
    let tempDate = temperature.ts != 0 ? new Date(temperature.ts) : new Date();
    let smaValue = sma.value;
    let smaDate = sma.ts != 0 ? new Date(sma.ts) : new Date();
    // update values
    document.getElementById("x").innerHTML = accValue["acc_x"] != "ok" ? accValue["acc_x"].toFixed(3) : accValue["acc_x"];
    document.getElementById("y").innerHTML = accValue["acc_y"] != "ok" ? accValue["acc_y"].toFixed(3) : accValue["acc_y"];
    document.getElementById("z").innerHTML = accValue["acc_z"] != "ok" ? accValue["acc_z"].toFixed(3) : accValue["acc_z"];
    document.getElementById("temperature").innerHTML = tempValue != "ok" ? tempValue.toFixed(3) + "°" : tempValue;
    document.getElementById("sma").innerHTML = smaValue != "ok" ? smaValue.toFixed(3) : smaValue;
    // update timestamp
    document.getElementById("tempUpdate").innerHTML = "Last update: " + tempDate.toLocaleString().split(" ")[1];
    document.getElementById("accUpdate").innerHTML = "Last update: " + accDate.toLocaleString().split(" ")[1];
    document.getElementById("smaUpdate").innerHTML = "Last update: " + smaDate.toLocaleString().split(" ")[1];
}

/**
 * Perform user operations.
 */
function userButton(auth) {
    let state = document.getElementById('signButton').innerHTML;
    if (state === "Sign Out") {
        document.getElementById("signButton").innerHTML = "Sign In";
        auth.signOut();
        showSignedOut();
    } else {
        auth.getSession();
    }
}

/** 
 * Operations when signed in.
 */
function showSignedIn() {
    document.getElementById("signButton").innerHTML = "Sign Out";
    document.getElementById("welcomeDiv").hidden = true;
    document.getElementById("mainDiv").hidden = false;
}

function setUser(username) {
    document.getElementById('userId').innerHTML = username;
    document.getElementById('dashboard').innerHTML = "Dashboard";
    document.getElementById('dashboard').setAttribute("href", "dashboard");
    document.getElementById('alert').hidden = false;
    document.getElementById("notificationSwitch").checked = false;
}

function getUserState() {
    let state = document.getElementById('signButton').innerHTML;
    if (state === "Sign Out") {
        document.getElementById("signButton").innerHTML = "Sign In";
        return true;
    }
    else {
        return false;
    }
}
/**  
 * Operations when signed out.
 */
function showSignedOut() {
    document.getElementById("signButton").innerHTML = "Sign In";
    document.getElementById("welcomeDiv").hidden = false;
    document.getElementById("mainDiv").hidden = true;
}

function addStatue(id, callback) {
    let radioDiv = document.createElement("div");
    radioDiv.setAttribute("id", id);
    createRadio(radioDiv, null, "statueRadios", id, id, callback);
    document.getElementById("statues").appendChild(radioDiv);
}

/**
 * Create radio element within the page
 * @param {string} div name of the div which will be used 
 * @param {string} id identifier of the element in the dom
 * @param {string} name of the radio group 
 * @param {string} value that will be passed to the callback
 * @param {string} text content to be viewed
 * @param {function} callback raised by the onchange evt listener
 */
function createRadio(div, id, name, value, text, callback) {
    if (!document.getElementById(id)) {
        let radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', name);
        radioInput.setAttribute('class', 'form-check-input');
        id && radioInput.setAttribute("id", id);
        radioInput.setAttribute("value", value);
        radioInput.addEventListener("click", (event) => { callback(event.target.value) })
        radioLabel = document.createElement('label');
        radioLabel.setAttribute('for', id);
        radioInput.setAttribute('class', 'form-check-label');
        radioLabel.appendChild(document.createTextNode(text));
        div.appendChild(radioInput);
        div.appendChild(radioLabel);
        div.appendChild(document.createElement('br'));
    }
}

function setSliders(id, callback, thresh) {
    updateSlider(id, callback, "temp_max_thresh", thresh!=null ? thresh.temp_max_thresh : null);
    updateSlider(id, callback, "temp_min_thresh", thresh!=null ? thresh.temp_min_thresh : null);
    updateSlider(id, callback, "acc_thresh", thresh!=null ? thresh.acc_thresh : null);
    updateSlider(id, callback, "sma_thresh", thresh!=null ? thresh.sma_thresh : null);
}

function updateSlider(id, callback, element, actualThreshold) {
    if (actualThreshold != null) {
        document.getElementById(element + "_div").hidden = false;
        document.getElementById(element).value = actualThreshold;
        document.getElementById(element + "_value").innerHTML = actualThreshold;
    }
    document.getElementById(element).onchange = (evt) => {
        callback(id, evt.target.value, element+"_value");
    }
}

function createAlert(title, body){
    let alert = document.createElement("li");
    alert.setAttribute("class", "list-group-item normal-text");
    alert.innerHTML = title+": "+body;
    return alert;
}

function updateNotificationCount(count){
    document.getElementById("alertCount").innerHTML = count;
}

function createErrorMessage(text){
    let errorSection = document.getElementById("error-section");
    let error = document.createElement("div");
    error.setAttribute("class", "alert alert-danger alert-dismissible fade show");
    error.setAttribute("role", "alert");
    let message = document.createElement("strong");
    message.innerHTML = text;
    error.appendChild(message);
    let closeButton = document.createElement("button");
    closeButton.setAttribute("type", "button");
    closeButton.setAttribute("class", "close");
    closeButton.setAttribute("data-dismiss", "alert");
    closeButton.setAttribute("aria-label", "Close");
    spanButton = document.createElement("span");
    spanButton.setAttribute("aria-hidden", "true");
    spanButton.innerHTML = "&times;";
    closeButton.appendChild(spanButton);
    error.appendChild(closeButton);
    errorSection.appendChild(error);
}