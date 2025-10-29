import { createVectorVisualization } from './vector_visualizer.js';
import { renderMathExpression, initializeMathInput } from './mathinput.js';

function InputNormal({ field, variable, disabled = false, onChange = null }) {
    var dom = document.createElement("div");
    var defaultValue = (variable.type == 'derived' ? '=' + variable.expression : variable.value);

    // Generate unique ID for value display
    const uniqueId = 'normal_' + Math.random().toString(36).substr(2, 9);

    dom.innerHTML = `<b class="field-title ${field ? '' : 'hidden'}">${field}:</b> <input value="${defaultValue}" ${disabled ? "disabled" : ""} /> <span class="variable-value-display" id="${uniqueId}_value">= ${variable.value}</span>`;

    const input = dom.querySelector("input");
    const valueDisplay = dom.querySelector(`#${uniqueId}_value`);

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

        updateValueDisplay();
        
        // Trigger onChange callback if provided
        if (onChange && typeof onChange === 'function') {
            onChange(variable, e.target.value);
        }
    });

    // Initial value display update
    updateValueDisplay();

    return dom;
}

function InputNumber({ field, variable, disabled = false, onChange = null }) {
    var dom = document.createElement("div");

    // Generate unique ID for value display
    const uniqueId = 'number_' + Math.random().toString(36).substr(2, 9);

    dom.innerHTML = `<b class="field-title ${field ? '' : 'hidden'}">${field}:</b> <input type="number" value="${variable.value}" ${disabled ? "disabled" : ""} /> <span class="variable-value-display" id="${uniqueId}_value">= ${variable.value}</span>`;

    const input = dom.querySelector("input");
    const valueDisplay = dom.querySelector(`#${uniqueId}_value`);

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

function InputRange({ field, variable, range = [0, 100], step = 1, disabled = false, onChange = null }) {
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

function InputVector2({ field, variable, disabled = false, onChange = null }) {
    var dom = document.createElement("div");
    dom.className = "input-vector2-container";

    // Generate unique IDs for this instance
    const uniqueId = 'vector2_' + Math.random().toString(36).substr(2, 9);
    const visualAreaId = uniqueId + '_visual';
    const infoAreaId = uniqueId + '_info';

    dom.innerHTML = `
        <b class="field-title ${field ? '' : 'hidden'}">${field}:</b>
        <div class="vector2-inputs">
            <div class="vector2-info-area ${disabled ? 'disabled' : ''}" id="${infoAreaId}"></div>
            <div class="vector2-visual-area" id="${visualAreaId}"></div>
        </div>
    `;

    const visualArea = dom.querySelector(`#${visualAreaId}`);
    const infoArea = dom.querySelector(`#${infoAreaId}`);

    // Initialize the vector visualization
    createVectorVisualization(visualArea, infoArea, variable, disabled, onChange);

    return dom;
}

function InputMath({ field, variable, disabled = false, onChange = null }) {
    console.log(variable, variable.expression)
    var dom = document.createElement("div");
    dom.className = "input-math-container";

    if (variable.type === 'derived') {
        const uniqueId = 'math_' + Math.random().toString(36).substr(2, 9);

        dom.innerHTML = `
            <div class="math-field-container">
                <b class="field-title ${field ? '' : 'hidden'}">${field}:</b>
                <div class="math-input-area"></div>
            </div>
        `;

        const mathInputArea = dom.querySelector('.math-input-area');

        // Use the math input utilities to create and manage the math input
        initializeMathInput(mathInputArea, variable, uniqueId, disabled, onChange);

        return dom;
    } else {
        return InputNormal({ field: field, variable: variable, disabled: disabled, onChange: onChange });
    }
}

export { InputNormal, InputNumber, InputRange, InputVector2, InputMath };