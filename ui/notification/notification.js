import { t } from "../../i18n/i18n.js";

const noticenter_dom = document.getElementById("notification-center");
const notibubbles = document.getElementById("notification-bubbles-area");

const notifications = [];

function init() {

}

/*
    Change the state of the notification center icon (at bottom-bar)
    state: "nothing", "normal", "warning", "error"
*/
function _chState() {
    var state = "nothing";

    notifications.forEach(noti => {
        if (noti.type === "error") {
            state = "error";
        } else if (noti.type === "warning" && state !== "error") {
            state = "warning";
        } else if (noti.type === "info" && state === "nothing") {
            state = "info";
        }
    });

    // Change the state of the notification center icon (at bottom-bar)
    noticenter_dom.className = `button symbol state-${state}`;
    noticenter_dom.innerHTML = {
        "nothing": "&#xED1E;",
        "info": "&#xED1E;",
        "warning": "&#xE7BA;",
        "error": "&#xE946;"
    }[state] || "";
}

function rmNoti(obj) {
    const index = notifications.indexOf(obj);
    if (index > -1) {
        notifications.splice(index, 1);
        _chState();
    }
}

function notify(title, message, proceedFunc, type, duration) {
    // Add notification to the list
    var notiItem = {
        title: title,
        message: message,
        type: type,
        timestamp: Date.now()
    };
    notifications.push(notiItem);

    // show bubble
    const bubble = document.createElement("div");
    bubble.className = `notification-bubble state-${type}`;
    bubble.innerHTML = `
        <div class='title'>${title}</div>
        <div class='message'>${message} <a style="${proceedFunc?'':'display: none;'}" href="javascript:void(0)">[${t("Handle Noti.")}]</a></div>
    `;
    // close-btn
    const close_btn = document.createElement("button");
    close_btn.className = "notification-bubble-close-btn symbol";
    close_btn.innerHTML = "&#xE711;";
    close_btn.onclick = () => {
        bubble.remove();
        if (proceedFunc === null) {
            rmNoti(notiItem);
        }
    };
    bubble.appendChild(close_btn);
    // proceed link
    const proceed_link = bubble.querySelector("a");
    if (proceed_link) {
        proceed_link.onclick = () => {
            proceedFunc();
            bubble.remove();
            rmNoti(notiItem);
        };
    }
    notibubbles.appendChild(bubble);

    if (duration > 0) {
        setTimeout(() => {
            bubble.remove();
            if (proceedFunc === null) {

            }
        }, duration);
    }

    // change notification center state
    _chState();
}

function info(title, message, proceedFunc = null, duration = 3000) {
    notify(title, message, proceedFunc, "info", duration);
}

function warning(title, message, proceedFunc = null, duration = 3000) {
    notify(title, message, proceedFunc, "warning", duration);
}

function error(title, message, proceedFunc = null, duration = 3000) {
    notify(title, message, proceedFunc, "error", duration);
}

export { init, notify, info, warning, error };