import * as InputControls from './input_controls.js';
import * as Labels from './label.js';
import * as Tables from './table.js';
import * as Radio from './radio.js';
import * as Display from './display.js'

function Dynamic(func) {
    // wrapper
    return () => {
        // this function will be called every time when rendering
        var contents = func();
        if (Array.isArray(contents)) {
            const container = document.createElement('div');
            contents.forEach((content) => {
                container.appendChild(content);
            });
            return container;
        } else if (contents instanceof HTMLElement) {
            return contents;
        } else {
            return document.createTextNode(String(contents));
        }
    };
}

const UIControls = {
    InputControls,
    Labels,
    Tables,
    Radio,
    Display,
    Dynamic
};

export default UIControls;
export { UIControls };
