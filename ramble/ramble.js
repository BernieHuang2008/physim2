import { $, $$ } from "../utils.js";
import { floating_section_expand } from "../ui/floatsec_utils.js";
import { t } from "../i18n/i18n.js";
import { genprompt } from "./prompts.js"
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { globalWorld, World } from "../phy/World.js";
import filev2 from "../phy/filev2.js";

var ramble_history = [genprompt("{{ MAIN_PROMPT }}", "system")];
var ramble_contents = [];
var ramble_backups = [];
var ramble_results = [];
var ramble_session = Math.random();

window.rambleRestoreBackup = function(index) {
    if (index < 0 || index >= ramble_backups.length) {
        console.error("Invalid backup index:", index);
        return;
    }
    const backupData = ramble_backups[index];
    if (backupData) {
        filev2.load(backupData);
        alert("Backup " + (index + 1) + " restored successfully!");
    } else {
        console.error("No backup data found for index:", index);
    }
}

function clear_ramble() {
    ramble_history = [genprompt("{{ MAIN_PROMPT }}", "system")];
    ramble_contents = [];
    ramble_backups = [];
    ramble_results = [];
    const chatArea = dom.rambleChatArea;
    chatArea.innerHTML = '';
    ramble_session = Math.random();
}

const dom = {
    rambleBtn: null,
    ramblePopover: null,
    rambleContentArea: null,
    rambleChatArea: null,
    rambleVoiceBtn: null,
    rambleClearBtn: null,
    rambleSendBtn: null
}

const ui = {
    controls: {},
    controlIdCounter: 0,
    addControl(control) {
        dom.rambleChatArea.appendChild(control);
        const controlId = ++this.controlIdCounter;
        control.dataset.controlId = String(controlId);
        this.controls[controlId] = control;
        return controlId;
    },
    rmControl(controlId) {
        const normalizedControlId = Number(controlId);
        const control = this.controls[normalizedControlId];
        if (control) {
            dom.rambleChatArea.removeChild(control);
            delete this.controls[normalizedControlId];
            ramble_contents = ramble_contents.filter((item) => item.controlId !== normalizedControlId);
        }
    },
    createLoadingControl(note) {
        const container = document.createElement('div');
        container.className = 'ramble-entry ramble-entry-loading';
        container.innerHTML = `
            <div class="ramble-loading-note">${note}</div>
            <div class="ramble-loading-spinner"></div>
        `;
        return container;
    },
    createSuccessControl(content) {
        const container = document.createElement('div');
        container.className = 'ramble-entry ramble-entry-success';
        container.textContent = content;
        return container;
    },
    addLoadingControl(note) {
        var controlId = this.addControl(this.createLoadingControl(note));
        return controlId;
    },
    fulfillLoadingControl(controlId, new_control) {
        const control = this.controls[controlId];
        if (control) {
            control.replaceWith(new_control);
            this.controls[controlId] = new_control;
        }
    },
    createFileControl(fileName, previewHTML) {
        const extMatch = fileName.match(/\.([^.]+)$/);
        const ext = extMatch ? extMatch[1].toUpperCase() : 'FILE';

        let hash = 0;
        for (let i = 0; i < ext.length; i++) {
            hash = ext.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        const bgColor = '#' + '00000'.substring(0, 6 - c.length) + c;

        const r = parseInt(bgColor.substr(1, 2), 16);
        const g = parseInt(bgColor.substr(3, 2), 16);
        const b = parseInt(bgColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        const textColor = (yiq >= 128) ? 'black' : 'white';

        const container = document.createElement('div');
        container.className = 'ramble-entry ramble-entry-file';
        container.innerHTML = `
            <button type="button" class="ramble-entry-close" aria-label="Remove file">&times;</button>
            <div class="ramble-file-icon" style="background-color: ${bgColor}; color: ${textColor};">
                ${ext}
            </div>
            <div class="ramble-file-info">
                <div class="ramble-file-name"><strong>${fileName}</strong></div>
                <div class="ramble-file-preview">${previewHTML}</div>
            </div>
        `;
        container.querySelector('.ramble-entry-close').addEventListener('click', (e) => {
            e.stopPropagation();
            ui.rmControl(container.dataset.controlId);
        });
        return container;
    },
    createFileImageControl(fileName, dataUrl) {
        const container = document.createElement('div');
        container.className = 'ramble-entry ramble-entry-file ramble-entry-file-image';
        container.innerHTML = `<button type="button" class="ramble-entry-close" aria-label="Remove file">&times;</button>`;

        const iconContainer = document.createElement('div');
        iconContainer.className = 'ramble-file-image-container';

        const img = document.createElement('img');
        img.src = dataUrl;
        img.className = 'ramble-file-image-thumbnail';

        iconContainer.appendChild(img);

        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const expandedContainer = document.createElement('div');
            expandedContainer.className = 'ramble-image-viewer';
            const expandedImg = document.createElement('img');
            expandedImg.src = dataUrl;
            expandedContainer.appendChild(expandedImg);

            dom.ramblePopover.appendChild(expandedContainer);

            const closeHandler = () => {
                expandedContainer.remove();
                document.removeEventListener('click', closeHandler);
            };
            setTimeout(() => {
                document.addEventListener('click', closeHandler);
            }, 0);
        });

        const info = document.createElement('div');
        info.className = 'ramble-file-info';
        info.innerHTML = `<div class="ramble-file-name"><strong>${fileName}</strong></div>
                          <div class="ramble-file-preview">Image</div>`;
        container.querySelector('.ramble-entry-close').addEventListener('click', (e) => {
            e.stopPropagation();
            ui.rmControl(container.dataset.controlId);
        });

        container.appendChild(iconContainer);
        container.appendChild(info);

        return container;
    }
}

function init_ramble() {
    const leftBar = $('#left-bar');

    // 1. Create Ramble Button Container (for absolute positioning at bottom)
    const rambleBtn = document.createElement('button');
    rambleBtn.id = 'ramble-btn';
    rambleBtn.className = 'ramble-btn left-bar-btn';
    rambleBtn.title = 'Ramble';

    // Voice Icon SVG
    rambleBtn.innerHTML = `
        <img alt="Ramble" src="/assets/icons/ramble_icon.svg">
    `;
    const rambleImg = rambleBtn.querySelector('img');

    leftBar.appendChild(rambleBtn);

    // init dom references
    dom.rambleBtn = rambleBtn;
    dom.rambleImg = rambleImg;
    dom.ramblePopover = $("#ramble-popover");
    dom.rambleContentArea = dom.ramblePopover.querySelector('#ramble-content');
    dom.rambleChatArea = dom.ramblePopover.querySelector('.ramble-chat-area');
    dom.rambleVoiceBtn = dom.ramblePopover.querySelector('#ramble-voice-btn');
    dom.rambleClearBtn = dom.ramblePopover.querySelector('.ramble-clear-btn');
    dom.rambleSendBtn = dom.ramblePopover.querySelector('#ramble-send-btn');

    // 3. Interactions
    dom.rambleBtn.addEventListener('click', (e) => {
        const isHidden = dom.ramblePopover.classList.contains('hide');
        if (isHidden) {
            const btnRect = dom.rambleBtn.getBoundingClientRect();
            floating_section_expand();
            dom.ramblePopover.style.left = (btnRect.right + 10) + 'px';
            dom.ramblePopover.style.bottom = Math.max(10, window.innerHeight - btnRect.bottom) + 'px';
            dom.ramblePopover.style.top = 'auto';
            dom.ramblePopover.classList.remove('hide');
        } else {
            dom.ramblePopover.classList.add('hide');
        }
    });

    dom.rambleClearBtn.addEventListener('click', () => {
        if (confirm(t('ramble_clear_confirm'))) {
            clear_ramble();
        }
    });

    // Textarea auto-resize
    const textarea = dom.ramblePopover.querySelector('textarea');
    textarea.setAttribute('rows', '1');
    textarea.style.overflowY = 'hidden';
    textarea.addEventListener('input', function () {
        this.style.height = 'auto'; // Reset height to allow shrinking
        this.style.height = (this.scrollHeight) + 'px'; // Set to actual scroll height
    });

    // Drag & Drop Handling
    function handleDragOver(e) {
        e.preventDefault();
        dom.rambleContentArea.classList.add('drag-over');
        dom.rambleBtn.classList.add('drag-over');
        dom.rambleImg.src = "/assets/icons/ramble_eating.svg";
    }
    function handleDragLeave(e) {
        dom.rambleContentArea.classList.remove('drag-over');
        dom.rambleBtn.classList.remove('drag-over');
        dom.rambleImg.src = "/assets/icons/ramble_icon.svg";
    }
    function handleDrop(e) {
        e.preventDefault();

        // expand ramble section
        const btnRect = dom.rambleBtn.getBoundingClientRect();
        floating_section_expand();
        dom.ramblePopover.style.left = (btnRect.right + 10) + 'px';
        dom.ramblePopover.style.bottom = Math.max(10, window.innerHeight - btnRect.bottom) + 'px';
        dom.ramblePopover.style.top = 'auto';
        dom.ramblePopover.classList.remove('hide');

        // process drop
        console.log(e)
        dom.rambleContentArea.classList.remove('drag-over');
        dom.rambleBtn.classList.remove('drag-over');
        dom.rambleImg.src = "/assets/icons/ramble_icon.svg";

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const dataUrl = event.target.result;
                        var controlId = ui.addControl(ui.createFileImageControl(file.name, dataUrl));
                        ramble_contents.push({
                            type: 'image',
                            name: file.name,
                            content: dataUrl,
                            controlId: controlId
                        });
                    }
                    reader.readAsDataURL(file);
                } else {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const fileContent = event.target.result;
                        var controlId = ui.addControl(ui.createFileControl(file.name, `<pre>${fileContent.split("\n")[0].substring(0, 200)}...</pre>`));

                        ramble_contents.push({
                            type: 'file',
                            name: file.name,
                            content: fileContent,
                            controlId: controlId
                        });
                    }
                    reader.readAsText(file);
                }
            }
        } else {
            const text = e.dataTransfer.getData('text/plain');
            if (text) {
                const fileName = 'text_snippet.txt';
                var controlId = ui.addControl(ui.createFileControl(fileName, `<pre>${text.split("\n")[0].substring(0, 200)}...</pre>`));
                ramble_contents.push({
                    type: 'file',
                    name: fileName,
                    content: text,
                    controlId: controlId
                });
            }
        }
    }

    dom.rambleContentArea.addEventListener('dragover', handleDragOver);
    dom.rambleContentArea.addEventListener('dragleave', handleDragLeave);
    dom.rambleContentArea.addEventListener('drop', handleDrop);
    dom.rambleBtn.addEventListener('dragover', handleDragOver);
    dom.rambleBtn.addEventListener('dragleave', handleDragLeave);
    dom.rambleBtn.addEventListener('drop', handleDrop);

    dom.rambleSendBtn.addEventListener('click', () => {
        const textareaValue = textarea.value.trim();
        if (textareaValue) {
            var controlId = ui.addControl(ui.createSuccessControl(textareaValue));
            ramble_contents.push({
                type: 'text',
                content: textareaValue,
                controlId: controlId
            });
            textarea.value = '';
            textarea.style.height = 'auto';
        }

        start_ramble();
    });
}

async function ask_ai(messages) {
    var endpoint = "https://api.openai.com/v1/chat/completions";
    var model = "gpt-3.5-turbo";
    var apikey = "your-api-key";

    if (localStorage.getItem('physim2-settings')) {
        const settings = JSON.parse(localStorage.getItem('physim2-settings'));
        if (settings.ai && settings.ai.source === 'custom') {
            endpoint = settings.ai.custom.endpoint;
            model = settings.ai.custom.model;
            apikey = settings.ai.custom.token;
        }
        else if (settings.ai && settings.ai.source === 'localStorage') {
            const aisettings = JSON.parse(localStorage.getItem('AI'));
            if (aisettings) {
                endpoint = aisettings.llm[settings.ai.tier].endpoint;
                model = aisettings.llm[settings.ai.tier].model;
                apikey = aisettings.llm[settings.ai.tier].token;
            }
        }
    }

    var waitcontrol = ui.addLoadingControl("AI thinking ...");

    var resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apikey}`
        },
        body: JSON.stringify({
            model: model,
            reasoning_effort: "medium",
            messages: messages
        }),
    });

    ui.fulfillLoadingControl(waitcontrol, ui.createSuccessControl("AI response received"));

    return await resp.json();
}

function start_ramble() {
    var waitcontrol = ui.addLoadingControl("Backup current world ...");
    ramble_backups.push(JSON.stringify(filev2.pack()));
    ui.fulfillLoadingControl(waitcontrol, ui.createSuccessControl("Backup completed"));

    // console.log("Current Ramble Contents:", ramble_contents);
    for (const content of ramble_contents) {
        if (content.type === 'text') {
            ramble_history.push({
                role: 'user',
                content: content.content
            });
        } else if (content.type === 'file') {
            ramble_history.push({
                role: 'user',
                content: content.content
            });
        } else if (content.type === 'image') {
            ramble_history.push({
                role: 'user',
                content: [
                    { type: 'text', text: `Image File: ${content.name}` },
                    {
                        type: 'image_url', image_url: {
                            url: content.content,
                        }
                    }
                ]
            });
        }
    }

    var messages = [...ramble_history];
    messages.push({
        role: 'user',
        content: 'Current World: ' + JSON.stringify(filev2.pack())
    });

    console.log("Final Messages Sent to AI:", messages);

    const sessionId = ramble_session;

    ask_ai(messages).then((response) => {
        console.log("AI Response:", response);
        if (response.choices && response.choices.length > 0) {
            if (sessionId !== ramble_session) {
                console.warn("Received AI response for an old session. Ignoring.");
                return;
            }

            const aiMessage = JSON.parse(response.choices[0].message.content);

            // update world
            filev2.load(aiMessage.new_world);

            // update history
            ramble_contents = [];
            ramble_history.push({
                role: 'assistant',
                content: aiMessage.summary
            });
            ramble_results.push(aiMessage.summary);

            // show summary
            for (var i=0; i<ramble_results.length; i++) {
                var html = marked.parse(ramble_results[i]);
                ui.addControl(ui.createSuccessControl("<a href='javascript:rambleRestoreBackup(" + i + ")'>Restore Backup " + (i + 1) + "</a>"));
                dom.rambleChatArea.innerHTML += html;
            }
            var html = marked.parse(aiMessage.summary);
            dom.rambleChatArea.innerHTML = html;

            console.log(aiMessage);
        } else {
            console.error("Unexpected AI response format:", response);
        }
    }).catch((error) => {
        console.error("Error while communicating with AI:", error);
    });
}

export { start_ramble, init_ramble }