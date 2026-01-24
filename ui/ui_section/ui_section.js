import { t } from "../../i18n/i18n.js";

var all_sections = [];
var area_sections_map = {};


class UI_Section {
    type = "section";
    title = t("Untitled Section");
    dom = null;
    dom_content = null;
    area = null;
    contents = [];
    return_to = null;   // return to this section when closed
    on = { activate: {}, deactivate: {} };    // event handlers

    _chain_constructor = null;

    constructor(title) {
        this.title = title;
        this.dom = document.createElement("div");

        // bind handlers
        this._onDragStart = this._onDragStart.bind(this);
        this._onDragMove = this._onDragMove.bind(this);
        this._onDragEnd = this._onDragEnd.bind(this);
        this._onResizeStart = this._onResizeStart.bind(this);
        this._onResizeMove = this._onResizeMove.bind(this);
        this._onResizeEnd = this._onResizeEnd.bind(this);

        this.init();
    }

    init() {
        this.dom.className = "ui-section";
        this.dom.innerHTML = `
        <div class='ui-section-title'>
            <button class='return-btn symbol'>&#xE0D5;</button>
            <span id="title">${this.title}</span>
            <button class='close-btn symbol' id="close-btn">&#xE711;</button>
        </div>
        <div class='ui-section-content'></div>
        <div class='ui-section-resize-handle'></div>`;
        this.dom_content = this.dom.querySelector(".ui-section-content");
        this.dom.querySelector("#close-btn").onclick = () => {
            this.deactivate("CLOSE");
        };
    }

    setTitle(newTitle) {
        this.title = newTitle;
        this.dom.querySelector("#title").textContent = newTitle;
    }

    activateAt(area) {
        this.area = area;
        area_sections_map[area] = area_sections_map[area] || [];

        this.activate();
    }

    activate(return_to = null) {
        switch (this.area.getAttribute("layout-type")) {
            case "bar":
                // clear area
                this.area.innerHTML = "";
                area_sections_map[this.area] = [];
                // disable drag/resize
                this._disableDragging();
                this._disableResizing();
                break;
            case "free":
                // enable drag/resize
                this._enableDragging();
                this._enableResizing();
                break;
        }

        this.area.appendChild(this.dom);
        area_sections_map[this.area].push(this);

        // return_to
        this.return_to = return_to;
        const return_btn = this.dom.querySelector(".return-btn");
        if (this.return_to) {
            this.return_to.deactivate("JUMP_TO_ANOTHER_SECTION");

            return_btn.style.display = "inline-block";
            return_btn.onclick = () => {
                this.deactivate("RETURN_TO_PREVIOUS_SECTION");
                this.return_to.activate();
            };
        } else {
            return_btn.style.display = "none";
            return_btn.onclick = null;
        }

        // trigger event
        for (let handler of Object.values(this.on.activate)) {
            handler();
        }
    }

    deactivate(msg = null) {
        // remove DOM
        this.dom.remove();

        // remove from area map
        if (this.area && area_sections_map[this.area]) {
            area_sections_map[this.area].pop();
        }

        // // activate last section in area
        // if (this.area && area_sections_map[this.area]) {
        //     const sections = area_sections_map[this.area];
        //     if (sections.length > 0) {
        //         const last_section = sections[sections.length - 1];
        //         last_section.activate();
        //     }
        // }

        // trigger event
        for (let handler of Object.values(this.on.deactivate)) {
            handler(msg);
        }
    }

    addHeadlessSubsection() {
        var subsection = {
            type: "headless-subsection",
            contents: [],
            dom: null,
        }
        this.contents.push(subsection);
        this._chain_constructor = subsection;
        return this;
    }

    addSubsection(title, collapsed = true) {
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

    addUIControl(component, params = null) {
        if (this._chain_constructor) {
            this._chain_constructor.contents.push({
                type: "ui-control",
                component: component,
                params: params,
                dom: null,
            });
        }
        else {
            throw new Error("UI Controls must be added within a subsection. Call addSubsection() or addHeadlessSubsection() first.");
        }

        return this;
    }

    addHTML(html, post_render_script = null) {
        if (this._chain_constructor) {
            this._chain_constructor.contents.push({
                type: "html",
                html: html,
                dom: null,
                post_render_script: post_render_script,
            });
        }
        else {
            throw new Error("HTML content must be added within a subsection. Call addSubsection() or addHeadlessSubsection() first.");
        }
        return this;
    }

    clearContent() {
        this.dom_content.innerHTML = "";
        this.contents = [];
        this._chain_constructor = null;
    }

    render() {
        function _create_headlesssubsection_dom(subsection) {
            var sub_dom = document.createElement("div");
            sub_dom.className = `ui-subsection no-select`;
            sub_dom.innerHTML = `
                <div class="subsection-content"></div>
            `;
            return sub_dom;
        }

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
            switch (subsection.type) {
                case "headless-subsection":
                    // render headless subsection
                    subsection.dom = subsection.dom || _create_headlesssubsection_dom(subsection);
                    break;
                case "subsection":
                    // render subsection
                    subsection.dom = subsection.dom || _create_subsection_dom(subsection);
                    break;
            }

            for (let content of subsection.contents) {
                switch (content.type) {
                    case "html":
                        content.dom = content.dom || _create_uicontrol_dom(subsection);
                        content.dom.innerHTML = content.html;
                        if (content.post_render_script) {
                            content.post_render_script(content.dom);
                        }
                        break;
                    case "ui-control":
                        content.dom = content.dom || _create_uicontrol_dom(subsection);
                        content.dom.innerHTML = "";
                        content.dom.appendChild(content.component(content.params));
                        break;
                }
            }

            this.dom_content.appendChild(subsection.dom);
        }
    }

    _enableDragging() {
        const titleBar = this.dom.querySelector('.ui-section-title');
        if (titleBar) {
            this.dom.style.position = 'absolute';
            titleBar.style.cursor = 'move';
            titleBar.removeEventListener('mousedown', this._onDragStart); // prevent duplicates
            titleBar.addEventListener('mousedown', this._onDragStart);
        }
    }

    _disableDragging() {
        const titleBar = this.dom.querySelector('.ui-section-title');
        if (titleBar) {
            this.dom.style.position = '';
            titleBar.style.cursor = '';
            titleBar.removeEventListener('mousedown', this._onDragStart);
        }
    }

    _onDragStart(e) {
        if (e.target.tagName === 'BUTTON') return; // Don't drag if clicking buttons
        this._isDragging = true;
        this._dragStartX = e.clientX;
        this._dragStartY = e.clientY;
        this._dragStartLeft = this.dom.offsetLeft;
        this._dragStartTop = this.dom.offsetTop;

        e.preventDefault();
        document.addEventListener('mousemove', this._onDragMove);
        document.addEventListener('mouseup', this._onDragEnd);
    }

    _onDragMove(e) {
        if (!this._isDragging) return;
        const dx = e.clientX - this._dragStartX;
        const dy = e.clientY - this._dragStartY;

        this.dom.style.left = (this._dragStartLeft + dx) + 'px';
        this.dom.style.top = (this._dragStartTop + dy) + 'px';
    }

    _onDragEnd() {
        this._isDragging = false;
        document.removeEventListener('mousemove', this._onDragMove);
        document.removeEventListener('mouseup', this._onDragEnd);
    }

    _enableResizing() {
        const resizeHandle = this.dom.querySelector('.ui-section-resize-handle');
        if (resizeHandle) {
            resizeHandle.removeEventListener('mousedown', this._onResizeStart);
            resizeHandle.addEventListener('mousedown', this._onResizeStart);
        }
    }

    _disableResizing() {
        const resizeHandle = this.dom.querySelector('.ui-section-resize-handle');
        if (resizeHandle) {
            resizeHandle.removeEventListener('mousedown', this._onResizeStart);
        }
    }

    _onResizeStart(e) {
        this._isResizing = true;
        this._resizeStartX = e.clientX;
        this._resizeStartY = e.clientY;
        this._resizeStartW = this.dom.offsetWidth;
        this._resizeStartH = this.dom.offsetHeight;

        e.preventDefault();
        e.stopPropagation(); // prevent drag
        document.addEventListener('mousemove', this._onResizeMove);
        document.addEventListener('mouseup', this._onResizeEnd);
    }

    _onResizeMove(e) {
        if (!this._isResizing) return;
        const dx = e.clientX - this._resizeStartX;
        const dy = e.clientY - this._resizeStartY;

        const newW = Math.max(200, this._resizeStartW + dx);
        const newH = Math.max(100, this._resizeStartH + dy);

        this.dom.style.width = newW + 'px';
        this.dom.style.height = newH + 'px';
    }

    _onResizeEnd() {
        this._isResizing = false;
        document.removeEventListener('mousemove', this._onResizeMove);
        document.removeEventListener('mouseup', this._onResizeEnd);
    }
}

export { UI_Section };