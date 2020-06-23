/** This file contains functions used to draw the dashboard */

/**
 * Set the active item within the navbar
 * @param {string} section if specified, it means that the mobile navbar must be considered
 */
function setModes(section) {
    let overall = document.getElementById("overall" + (section != null ? "_mobile" : ""));
    let lastHour = document.getElementById("lasthour" + (section != null ? "_mobile" : ""));

    let overallLink = overall.children[0];
    let lastHourLink = lastHour.children[0];

    overallLink.addEventListener("click", () => { overall.setAttribute("class", "active"); lastHour.setAttribute("class", ""); changeMode(false); });
    lastHourLink.addEventListener("click", () => { overall.setAttribute("class", ""); lastHour.setAttribute("class", "active"); changeMode(true); });
}

/**
 * Change the operating mode of the dashboard (overall/last hour)
 * @param {boolean} value true if we want data from last hour, false otherwise
 */
function changeMode(value) {
    request.message.lastHour = value;
    console.log("sending: %o", request);
    socket.send(JSON.stringify(request));
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
        radioInput.setAttribute("id", id);
        radioInput.setAttribute("value", value);
        radioInput.addEventListener("click", (event) => { callback(event.target.value) })
        radioLabel = document.createElement('label');
        radioLabel.setAttribute('for', id);
        radioLabel.appendChild(document.createTextNode(text));
        div.appendChild(radioInput);
        div.appendChild(radioLabel);
        div.appendChild(document.createElement('br'));
    }
}

/**
 * Remove all elements from a div
 * @param {string} divId 
 * @param {string} titleDiv 
 */
function initDiv(divId, titleDiv) {
    let divDom = document.getElementById(divId);
    if (divDom) {
        divDom.textContent = "";
        let title = document.createElement('h4');
        title.textContent = titleDiv;
        divDom.appendChild(title);
    }
    return divDom;
}

/**
 * Clear divs showing axis info
 */
function clearAnalytics() {
    let elements = document.getElementsByTagName('session');
    while (elements[0]) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    initDiv("sma", "SMA");
    initDiv("temp", "Temperature");
    initDiv("x", "X-Axis");
    initDiv("y", "Y-Axis");
    initDiv("z", "Z-Axis");
}

/**
 * Callback to use when we want to show information from a particular sample
 * @param {any} json containing data
 * @param {action} string type of information 
 */
function sampleCallback(data, action) {
    console.log(data, action);
    switch (action) {
        case "temp":
            let tempDiv = initDiv("temp", "Temperature");
            Object.keys(data).forEach(statue =>
                Object.keys(data[statue]).forEach(sample => {
                    let temp = document.createElement("p");
                    temp.textContent = data[statue][sample].toFixed(3) + "° (" + new Date(Number(sample)).toLocaleString() + ")";
                    tempDiv.appendChild(temp);
                })
            )
            break;
        case "sma":
            let smaDiv = initDiv("sma", "SMA");
            Object.keys(data).forEach(statue =>
                Object.keys(data[statue]).forEach(sample => {
                    let sma = document.createElement("p");
                    sma.textContent = data[statue][sample].toFixed(3) + "dB (" + new Date(Number(sample)).toLocaleString() + ")";
                    smaDiv.appendChild(sma);
                })
            )
            break;
        case "acc":
            let xDiv = initDiv("x", "X-Axis");
            let yDiv = initDiv("y", "Y-Axis");
            let zDiv = initDiv("z", "Z-Axis");
            data && Object.keys(data).forEach(statue => {
                Object.keys(data[statue]).forEach(sample => {
                    let x = document.createElement("p");
                    x.textContent = (isNaN(data[statue][sample]["acc_x"]) ? "ok " : data[statue][sample]["acc_x"].toFixed(3) + "g ") + "(" + new Date(Number(sample)).toLocaleString() + ")";
                    xDiv.appendChild(x);
                    let y = document.createElement("p");
                    y.textContent = (isNaN(data[statue][sample]["acc_y"]) ? "ok " : data[statue][sample]["acc_y"].toFixed(3) + "g ") + "(" + new Date(Number(sample)).toLocaleString() + ")";
                    yDiv.appendChild(y);
                    let z = document.createElement("p");
                    z.textContent = (isNaN(data[statue][sample]["acc_z"]) ? "ok " : data[statue][sample]["acc_z"].toFixed(3) + "g ") + "(" + new Date(Number(sample)).toLocaleString() + ")";
                    zDiv.appendChild(z);
                })
            });

    }

}