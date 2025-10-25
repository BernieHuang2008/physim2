import { t } from "../i18n/i18n.js";

var all_sections = [];
var area_sections_map = {};


class UI_Section {
    type = "section";
    title = t("Untitled Section");
    dom = null;
    dom_content = null;
    area = null;
    contents = [];

    _chain_constructor = null;

    constructor(title) {
        this.title = title;
        this.dom = document.createElement("div");
        this.init();
    }

    init() {
        this.dom.className = "ui-section";
        this.dom.innerHTML = `
        <div class='ui-section-title'>
            ${this.title}
            <button class='close-btn symbol' onclick="this.closest('.ui-section').remove()">&#xE711;</button>
        </div>
        <div class='ui-section-content'></div>`;
        this.dom_content = this.dom.querySelector(".ui-section-content");
    }

    activateAt(area) {
        this.area = area;
        this.activate();
    }

    activate() {
        this.area.appendChild(this.dom);
        area_sections_map[this.area].push(this);

        // return_to
        this.return_to = return_to;
        const return_btn = this.dom.querySelector(".return-btn");
        if (this.return_to) {
            this.return_to.deactivate();

            return_btn.style.display = "inline-block";
            return_btn.onclick = () => {
                this.deactivate();
                this.return_to.activate();
            };
        } else {
            return_btn.style.display = "none";
            return_btn.onclick = null;
        }
    }

    deactivate() {
        this.dom.remove();
    }

    addSubsection(title, collapsed=true) {
        var subsection = {
            type: "subsection",
            title: title,
            contents: [],
            collapsed: collapsed,
            dom: null,
        }
        this.contents.push(subsection);
        this._chain_constructor = subsection;
        return this;
    }

    addUIControl(component, params) {
        if (this._chain_constructor) {
            this._chain_constructor.contents.push({
                type: "ui-control",
                component: component,
                params: params,
                dom: null,
            });
        }
        return this;
    }

    addHTML(html) {
        if (this._chain_constructor) {
            this._chain_constructor.contents.push({
                type: "html",
                html: html,
                dom: null,
            });
        }
        else {
            this.contents.push({
                type: "html",
                html: html,
                dom: null,
            });
        }
        return this;
    }

    clearContent() {
        this.dom_content.innerHTML = "";
        this.contents = [];
        this._chain_constructor = null;
    }

    render() {
        function _create_subsection_dom(subsection) {
            var sub_dom = document.createElement("div");
            sub_dom.className = `ui-subsection no-select ${subsection.collapsed ? 'collapsed' : ''}`;
            sub_dom.innerHTML = `
                <div class="subsection-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="ui-label-h3">${subsection.title}</h3>
                </div>
                <div class="subsection-content"></div>
            `;
            return sub_dom;
        }

        function _create_uicontrol_dom(subsection) {
            var control_dom = document.createElement("div");
            control_dom.className = "ui-control";
            
            var subcontent_dom = subsection.dom.querySelector(".subsection-content");
            subcontent_dom.appendChild(control_dom);
            return control_dom;
        }

        for (let subsection of this.contents) {
            if (subsection.type === "html") {
                var html_dom = subsection.dom || document.createElement("div");
                html_dom.innerHTML = subsection.html;
                this.dom_content.appendChild(html_dom);
                subsection.dom = html_dom;
            }
            if (subsection.type === "subsection") {
                // render subsection
                subsection.dom = subsection.dom || _create_subsection_dom(subsection);

                for (let content of subsection.contents) {
                    content.dom = content.dom || _create_uicontrol_dom(subsection);
                    content.dom.innerHTML = "";
                    content.dom.appendChild(content.component(content.params));
                }

                this.dom_content.appendChild(subsection.dom);
            }
        }
    }
}

export { UI_Section };