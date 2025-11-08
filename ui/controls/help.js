import { $, $$ } from '../../utils.js';
import { t } from '../../i18n/i18n.js';

const helpBox = $("#help-page");

var keydict = {};

const MAN_STYLE = `
    <style>
        table {
            border-collapse: collapse;
        }
        tr:nth-child(2n) {
            background-color: #f8f8f8;
        }
        td {
            border: 1px solid #ddd;
            padding: 6px 13px;
        }

        code {
            background-color: #b2b2b244;
            padding: 0.2rem 0.4rem;
            border-radius: 0.3rem;
        }
    </style>
`;

function render_helppage(help_content) {
    var helpWindow = open("", "_blank", "width=600,height=400,scrollbars=yes,resizable=yes");
    helpWindow.document.title = "Help";
    helpWindow.document.body.style.fontFamily = "Arial, sans-serif";
    helpWindow.document.body.style.padding = "1em";
    helpWindow.document.body.innerHTML = help_content;
}

function render_helpbox(dom, help) {
    helpBox.style.setProperty("display", "block", "important");
    helpBox.style.left = (dom.getBoundingClientRect().right + 5) + "px";
    helpBox.style.top = (dom.getBoundingClientRect().top) + "px";

    helpBox.innerHTML = help.content;
    if (helpBox.getBoundingClientRect().right > window.innerWidth) {
        helpBox.style.left = (dom.getBoundingClientRect().left - helpBox.getBoundingClientRect().width - 5) + "px";
    }
    if (helpBox.getBoundingClientRect().bottom > window.innerHeight) {
        helpBox.style.top = (window.innerHeight - helpBox.getBoundingClientRect().height - 5) + "px";
    }

    helpBox.querySelectorAll("a").forEach(a => {
        // look like: <a h="#K/help_id">
        if (a.getAttribute("h").startsWith("#")) {
            var key = a.getAttribute("h").slice(1, 2);
            var help_id = a.getAttribute("h").slice(3);
            keydict[key] = help_id;
            a.style.setProperty("--help-key", `"${key}"`);
        }
    });
}

function mkHelp(dom, help) {
    dom.onmouseenter = function () {
        render_helpbox(dom, help);
    }
    dom.onmouseleave = function () {
        helpBox.style.display = "none";
        keydict = {};
    }
}

document.body.addEventListener("keydown", (e) => {
    if (helpBox.style.display === "block") {
        var key = e.key.toUpperCase();
        if (key in keydict) {
            const help_id = keydict[key];
            const help_content = t("MAN_" + help_id);
            console.log("Help Key Pressed:", e.key, "->", help_id);
            render_helppage(help_content + MAN_STYLE);
        }
    }
});

export { mkHelp };