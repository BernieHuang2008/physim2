import { createVectorVisualization } from './vector_visualizer.js';
import { renderMathExpression, initializeMathInput } from './mathinput.js';
import { mkHelp } from './help.js';

function InputNormal({ field, variable, disabled = false, onChange = null, help = null, hide = false }) {
    if (hide) {
        return document.createElement("div");
    }
    
    var dom = document.createElement("div");
    var defaultValue = (variable.type == 'derived' ? '=' + variable.expression : variable.value);

    dom.innerHTML = `
        <b class="field-title ${field ? '' : 'hidden'}">${field}:</b> 
        <input value="${defaultValue}" ${disabled ? "disabled" : ""} />
        ${help ? `<div class="help symbol">&#xE9CE;</div>` : ''}
    `;

    const input = dom.querySelector("input");

    let isEditing = false;
    // Show/hide value display based on focus
    input.addEventListener("focus", () => {
        isEditing = true;
    });

    input.addEventListener("blur", () => {
        isEditing = false;
    });

    input.addEventListener("change", (e) => {
        if (disabled) return;
        if (e.target.value == "") return e.target.value = defaultValue;

        if (e.target.value.startsWith('=')) {
            try {
                variable.resetWithParams({
                    value: e.target.value.slice(1),
                    type: 'derived',
                });
            } catch (error) {
                e.target.value = defaultValue;
                throw error;
            }
            defaultValue = e.target.value;
        } else {
            variable.resetWithParams({
                value: e.target.value,
                type: 'immediate',
            });
            defaultValue = e.target.value;
        }
        
        // Trigger onChange callback if provided
        if (onChange && typeof onChange === 'function') {
            onChange(variable, e.target.value);
        }
    });

    return dom;
}

function InputNumber({ field, variable, disabled = false, onChange = null, hide = false }) {
    if (hide) {
        return document.createElement("div");
    }
    
    var dom = document.createElement("div");

    dom.innerHTML = `<b class="field-title ${field ? '' : 'hidden'}">${field}:</b> <input type="number" value="${variable.value}" ${disabled ? "disabled" : ""} /> <span class="variable-value-display" id="value">= ${variable.value}</span>`;

    const input = dom.querySelector("input");
    const valueDisplay = dom.querySelector(`#value`);

    let isEditing = false;

    // Function to update the value display
    function updateValueDisplay() {
        try {
            const currentValue = variable.value;
            valueDisplay.textContent = `= ${currentValue}`;
        } catch (error) {
            valueDisplay.textContent = `= Error`;
        }
    }

    // Show/hide value display based on focus
    input.addEventListener("focus", () => {
        isEditing = true;
        valueDisplay.classList.add('hidden');
    });

    input.addEventListener("blur", () => {
        isEditing = false;
        valueDisplay.classList.remove('hidden');
        updateValueDisplay();
    });

    input.addEventListener("change", (e) => {
        if (disabled) return;
        const newValue = parseFloat(e.target.value);
        if (isNaN(newValue)) return;

        variable.resetWithParams({
            value: newValue,
            type: 'immediate',
        });

        updateValueDisplay();
        
        // Trigger onChange callback if provided
        if (onChange && typeof onChange === 'function') {
            onChange(variable, newValue);
        }
    });

    // Initial value display update
    updateValueDisplay();

    return dom;
}

function InputRange({ field, variable, range = [0, 100], step = 1, disabled = false, onChange = null, hide = false }) {
    if (hide) {
        return document.createElement("div");
    }
    
    var dom = document.createElement("div");
    dom.innerHTML = `<b class="field-title ${field ? '' : 'hidden'}">${field}:</b> <input type="range" value="${variable.value}" ${disabled ? "disabled" : ""} min="${range[0]}" max="${range[1]}" step="${step}" /> <label id="value-disp">${variable.value}</label>`;

    dom.querySelector("input").addEventListener("input", (e) => {
        if (disabled) return;
        const newValue = parseFloat(e.target.value);
        if (isNaN(newValue)) return;

        dom.querySelector("#value-disp").innerText = newValue;
        variable.resetWithParams({
            value: newValue,
            type: 'immediate',
        });
        
        // Trigger onChange callback if provided
        if (onChange && typeof onChange === 'function') {
            onChange(variable, newValue);
        }
    });

    return dom;
}

function InputVector2({ field, variable, disabled = false, onChange = null, help = null, hide = false }) {
    if (hide) {
        return document.createElement("div");
    }
    
    var dom = document.createElement("div");
    dom.className = "input-vector2-container";

    dom.innerHTML = `
        <b class="field-title ${field ? '' : 'hidden'}">${field}: ${help?'<div class="help symbol">&#xE9CE;</div>':''}</b>
        <div class="vector2-inputs">
            <div class="vector2-info-area ${disabled ? 'disabled' : ''}" id="info"></div>
            <div class="vector2-visual-area" id="visual"></div>
        </div>
    `;

    if (help) {
        mkHelp(dom.querySelector('.help'), help);
    }

    const visualArea = dom.querySelector(`#visual`);
    const infoArea = dom.querySelector(`#info`);

    // Initialize the vector visualization
    createVectorVisualization(visualArea, infoArea, variable, disabled, onChange);

    return dom;
}

function InputMath({ field, variable, disabled = false, onChange = null, help = null, hide = false }) {
    if (hide) {
        return document.createElement("div");
    }
    
    var dom = document.createElement("div");
    dom.className = "input-math-container";

    if (variable.type === 'derived') {
        dom.innerHTML = `
            <div class="math-field-container">
                <b class="field-title ${field ? '' : 'hidden'}">${field}:</b>
                <div class="math-input-area"></div>
                ${help ? `<div class="help symbol">&#xE9CE;</div>` : ''}
            </div>
        `;

        if (help) {
            mkHelp(dom.querySelector('.help'), help);
        }

        const mathInputArea = dom.querySelector('.math-input-area');

        // Use the math input utilities to create and manage the math input
        initializeMathInput(mathInputArea, variable, disabled, onChange);

        return dom;
    } else {
        return InputNormal({ field: field, variable: variable, disabled: disabled, onChange: onChange, hide: hide });
    }
}

function InputColor({ field, variable, disabled = false, onChange = null, hide = false }) {
    if (hide) {
        return document.createElement("div");
    }
    
    var dom = document.createElement("div");
    dom.innerHTML = `
        <b class="field-title ${field ? '' : 'hidden'}">${field}:</b> 
        <input type="color" value="${variable.value}" ${disabled ? "disabled" : ""} />
    `;
    const input = dom.querySelector("input");

    input.addEventListener("change", (e) => {
        if (disabled) return;
        const newValue = e.target.value;
        variable.resetWithParams({
            value: newValue,
            type: 'immediate',
        });

        // Trigger onChange callback if provided
        if (onChange && typeof onChange === 'function') {
            onChange(variable, newValue);
        }
    });

    return dom;
}

export { InputNormal, InputNumber, InputRange, InputVector2, InputMath, InputColor };