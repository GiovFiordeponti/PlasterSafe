/** This file contains functions used to draw the dashboard */


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
        let titleContent = document.createElement('strong');
        titleContent.textContent = titleDiv;
        title.appendChild(titleContent);
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
    initDiv("sma", "Magnitude");
    initDiv("temp", "Temperature");
    initDiv("x", "X-Axis");
    initDiv("y", "Y-Axis");
    initDiv("z", "Z-Axis");
    initDiv("error", "Errors");
    initDiv("thresh", "Threshold Variations");
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
                Object.keys(data[statue]).sort().forEach(sample => {
                    let temp = document.createElement("p");
                    temp.textContent = data[statue][sample].toFixed(3) + "° (" + new Date(Number(sample)).toLocaleString() + ")";
                    tempDiv.appendChild(temp);
                })
            )
            break;
        case "sma":
            let smaDiv = initDiv("sma", "Magnitude");
            Object.keys(data).forEach(statue =>
                Object.keys(data[statue]).sort().forEach(sample => {
                    let sma = document.createElement("p");
                    sma.textContent = data[statue][sample].toFixed(3) + "g (" + new Date(Number(sample)).toLocaleString() + ")";
                    smaDiv.appendChild(sma);
                })
            )
            break;
        case "acc":
            let xDiv = initDiv("x", "X-Axis");
            let yDiv = initDiv("y", "Y-Axis");
            let zDiv = initDiv("z", "Z-Axis");
            data && Object.keys(data).forEach(statue => {
                Object.keys(data[statue]).sort().forEach(sample => {
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
            break;
        case "err":
            let errDiv = initDiv("error", "Errors");
            Object.keys(data).forEach(statue =>
                Object.keys(data[statue]).sort().forEach(sample => {
                    let error = document.createElement("p");
                    error.textContent = "No message since " + new Date(Number(data[statue][sample])).toLocaleString().split(" ")[1] + " (" + new Date(Number(sample)).toLocaleString() + ")";
                    errDiv.appendChild(error);
                })
            )
            break;
        case "thresh":
            let threshDiv = initDiv("thresh", "Threshold Variations");
            Object.keys(data).forEach(statue =>
                Object.keys(data[statue]).sort().forEach(sample => {
                    let thresh = document.createElement("p");
                    let variation = data[statue][sample];
                    let msg = "";
                    Object.keys(variation).forEach(item => {
                        let sensor = item.split("_")[0];
                        switch (sensor) {
                            case "acc":
                                msg = "Acceleration threshold changed to " + variation[item] + " g";
                                break;
                            case "sma":
                                msg = "Magnitude threshold changed to " + variation[item] + " g";
                                break;
                            case "temp":
                                if (item.split("_")[1] == "min") {
                                    msg = "Temperature lower threshold changed to " + variation[item] + "°";
                                }
                                else {
                                    msg = "Temperature upper threshold changed to " + variation[item] + "°";
                                }
                                break;
                        }
                    });
                    thresh.textContent = msg + " (" + new Date(Number(sample)).toLocaleString() + ")";
                    threshDiv.appendChild(thresh);
                })
            )

    }

}