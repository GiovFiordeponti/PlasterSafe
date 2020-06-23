var notificationEnabled = false;
var firstTime = false;

function initNotification() {
    notificationEnabled = document.getElementById("notificationSwitch").checked;
    if (notificationEnabled && firstTime == false) {
        console.log("checking permission for notification");
        createNotification();
        firstTime = true;
    }
}

function showNotification(notification){
    document.getElementById("alert-group").prepend(createAlert(notification.title, notification.body));
    if(notificationEnabled == true){
        console.log("creating notification");
        createNotification(notification.title, notification.body, notification.icon);
    }
}
function createNotification(title, body, icon) {
    if (!("Notification" in window)) {
        console.warn("This browser does not support notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        title != null && body != null  && new Notification(title, { body: body, icon: icon });
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                title != null && body != null && new Notification(title, { body: body, icon: icon });
            }
        });
    }
}