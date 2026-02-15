import { t } from "../../i18n/i18n.js";
import { floating_section_expand } from "../floatsec_utils.js";
import {$, $$} from "../../utils.js";

const notibadge_dom = $("#notification-badge");
const notibubbles_dom = $("#notification-bubbles-area");
const noticenter_dom = $("#notification-center");

const notifications = [];

function init() {
    _chState();
    notibadge_dom.onclick = showNotiCenter;
}

function renderNotiCenter() {
    noticenter_dom.innerHTML = `
        <div class="noti-center-header no-select">
            <center>${t("Notifications")} 🔔</center>
            <span class="symbol" id="clear-all">&#xE795;</span>
            <br>
        </div>
    `;

    // render notifications in the center
    noticenter_dom.innerHTML += notifications.map(noti => `
        <div class="notification noti state-${noti.type}">
            <div class="operations">
                <span class="symbol close-btn no-select" data-index="${notifications.indexOf(noti)}">
                    &#xE711;
                </span>
            </div>
            <div class="title">${noti.title}</div>
            <div class="message">${noti.message}</div>
        </div>
    `).join("");

    noticenter_dom.querySelector("#clear-all").onclick = function () {
        notifications.splice(0, notifications.length);
        renderNotiCenter();
        _chState();
    }

    noticenter_dom.querySelectorAll(".close-btn").forEach(btn => {
        const notification = notifications[parseInt(btn.getAttribute("data-index"))];
        btn.onclick = function () {
            noticenter_dom.removeChild(btn.parentElement.parentElement);
            rmNoti(notification);
        };
    });

    // if no notifications
    if (notifications.length === 0) {
        noticenter_dom.innerHTML = `<center>${t("No notifications.")}</center>`;
    }
}

function showNotiCenter() {
    floating_section_expand();
    noticenter_dom.classList.toggle("hide");
    renderNotiCenter();
    // remove bubbles
    notibubbles_dom.innerHTML = "";
}

/*
    Change the state of the notification badge icon (at bottom-bar)
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

    // Change the state of the notification badge icon (at bottom-bar)
    notibadge_dom.className = `button symbol noti state-${state}`;
    notibadge_dom.innerHTML = {
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
    bubble.className = `notification-bubble noti state-${type}`;
    bubble.innerHTML = `
        <div class='title'>${title}</div>
        <div class='message'>${message} <a style="${proceedFunc ? '' : 'display: none;'}" href="javascript:void(0)">[${t("Handle Noti.")}]</a></div>
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
    notibubbles_dom.appendChild(bubble);

    if (duration > 0) {
        setTimeout(() => {
            bubble.remove();
        }, duration);
    }

    // change notification badge state
    _chState();
}

function info(title, message, proceedFunc = null, duration = 5000) {
    notify(title, message, proceedFunc, "info", duration);
}

function warning(title, message, proceedFunc = null, duration = 10000) {
    notify(title, message, proceedFunc, "warning", duration);
}

function error(title, message, proceedFunc = null, duration = 10000) {
    notify(title, message, proceedFunc, "error", duration);
}

const infoBadge = $("#info-badge");
function badgeInfoClose() {
    infoBadge.onclick = null;
    infoBadge.innerText = "";
    infoBadge.style.color = "";
    infoBadge.style.background = "";
}

function badgeInfo(message, proceedFunc = null, duration = -1, color, bgColor) {
    infoBadge.innerText = message;
    infoBadge.style.color = color || "var(--text-color)";
    infoBadge.style.background = bgColor || "var(--primary-color)";

    if (proceedFunc) {
        infoBadge.onclick = () => {
            proceedFunc();
            badgeInfoClose();
        };
    }

    if (duration > 0) {
        setTimeout(badgeInfoClose, duration);
    }
}

export { init, notify, info, warning, error, badgeInfo, badgeInfoClose };