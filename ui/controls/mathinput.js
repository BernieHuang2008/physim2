import { math } from '../../phyEngine/math.js';
import * as Noti from '../notification/notification.js';
import { t } from '../../i18n/i18n.js';

const VAR_IN_MATH_SPECIAL_CHAR = "\u200B"; //"🥒";
const VAR_IN_MATH_SPECIAL_CHAR_HEX = "200B";
const TARGET_IN_MATH_SPECIAL_CHAR = "\u200A";
const TARGET_IN_MATH_SPECIAL_CHAR_HEX = "200A";


// MathJax initialization
let mathJaxLoaded = false;
let mathJaxPromise = null;

/**
 * Initialize MathJax dynamically
 * @returns {Promise} Promise that resolves when MathJax is ready
 */
async function initMathJax() {
    if (mathJaxLoaded && window.MathJax) {
        return window.MathJax;
    }

    if (mathJaxPromise) {
        return mathJaxPromise;
    }

    mathJaxPromise = new Promise((resolve, reject) => {
        try {
            // Configure MathJax before loading
            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    processEscapes: true,
                    processEnvironments: true
                },
                svg: {
                    fontCache: 'global'
                },
                startup: {
                    ready: () => {
                        console.log('MathJax is loaded and ready.');
                        window.MathJax.startup.defaultReady();
                        mathJaxLoaded = true;
                        resolve(window.MathJax);
                    }
                }
            };

            // Dynamically load MathJax script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
            script.async = true;
            script.onload = () => {
                // MathJax will call startup.ready when it's fully loaded
            };
            script.onerror = (error) => {
                Noti.error(t("MathJax Load Failed"), "Failed to load MathJax script. Mathematical expressions may not display correctly.");
                console.error('Failed to load MathJax script:', error);
                reject(error);
            };

            document.head.appendChild(script);
        } catch (error) {
            Noti.error(t("MathJax Init Failed"), "Failed to initialize MathJax. Mathematical expressions may not display correctly.");
            console.error('Failed to initialize MathJax:', error);
            reject(error);
        }
    });

    return mathJaxPromise;
}

/**
 * Convert a MathJS expression to LaTeX format
 * @param {string} expression - The mathematical expression in MathJS format
 * @returns {string} LaTeX representation of the expression
 */
function expressionToLatex(expression, world=null) {
    const keywords = ['pos', 'v', 'mass', 'time', /VAR\\_[0-9A-Z]{9,9}/g, /TARGET\\_[a-zA-Z0-9_]+/g];

    try {
        // Parse the expression using MathJS
        const node = math.parse(expression);

        // Convert to LaTeX using MathJS built-in toTex method
        let latex = node.toTex();

        // Replace keywords with \text{} format
        keywords.forEach(keyword => {
            if (keyword instanceof RegExp) {
                latex = latex.replace(keyword, match => {
                    var header = match.split('\\_')[0];
                    var var_id = match.split('\\_')[1];
                    var placeholder = "";   // to prevent layout issues

                    switch (header) {
                        case 'TARGET':
                            header = TARGET_IN_MATH_SPECIAL_CHAR;
                            placeholder = "xxx";
                            break;
                        case 'VAR':
                            header = VAR_IN_MATH_SPECIAL_CHAR;
                            placeholder = "x";
                            var_id = world?world.vars["VAR_"+var_id].nickname:var_id;
                            break;
                    }

                    return `{${header}${placeholder}}_{${var_id}}`;
                });
            } else {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                latex = latex.replace(regex, `\\text{${keyword}}`);
            }
        });

        return enhanceLatex(latex);
    } catch (error) {
        Noti.warning(t("LaTeX Conversion Failed"), `Failed to convert expression "${expression}" to LaTeX. Using fallback display.`);
        console.warn('Failed to convert expression to LaTeX:', expression, error);
        // Fallback: return the original expression wrapped in text mode
        return `\\text{${expression}}`;
    }
}

/**
 * Render LaTeX expression using MathJax
 * @param {HTMLElement} element - The element to render the math in
 * @param {string} latexExpression - The LaTeX expression to render
 * @returns {Promise} Promise that resolves when rendering is complete
 */
async function renderMathJax(element, latexExpression, world=null) {
    try {
        const MathJax = await initMathJax();

        // Convert LaTeX to SVG using MathJax
        const svgNode = MathJax.tex2svg(latexExpression, {
            display: false,
            em: 16,
            ex: 8,
            containerWidth: 1200
        });

        // add comments to the variables
        var vardoms = Array.from(svgNode.querySelectorAll('g[data-mml-node="msub"]')).filter(g => {
            if (!g.children[0].querySelectorAll("use") || g.children[0].querySelectorAll("use")[0].dataset.c !== VAR_IN_MATH_SPECIAL_CHAR_HEX) return false;
            return true;
        });
        var targetdoms = Array.from(svgNode.querySelectorAll('g[data-mml-node="msub"]')).filter(g => {
            if (!g.children[0].querySelectorAll("use") || g.children[0].querySelectorAll("use")[0].dataset.c !== TARGET_IN_MATH_SPECIAL_CHAR_HEX) return false;
            return true;
        });

        vardoms.forEach(vardom => {
            // // extract var_id
            // var var_id = "";
            // for (let i = 0; i < 9; i++) {
            //     var c = parseInt(vardom.children[1].querySelectorAll("use")[i].dataset.c, 16);
            //     var_id += String.fromCharCode(c > 127 ? c - 0x1D3F3 : c);
            // }
            var var_id = "";
            var i = 0;
            while (i < vardom.children[1].querySelectorAll("use").length) {
                var c = parseInt(vardom.children[1].querySelectorAll("use")[i].dataset.c, 16);
                if (isNaN(c)) break;
                var_id += String.fromCharCode(c >= 0x1D44E ? c - 0x1D3ED : c >= 127 ? c - 0x1D3F3 : c);
                i++;
            }

            // find the variable in the registry 
            var nickname = var_id;
            // var nickname = world.vars["VAR_"+var_id].nickname;

            // add foreignObject
            vardom.innerHTML = `
                <foreignObject>
                    <span xmlns="http://www.w3.org/1999/xhtml" class="var-in-math var" data-var-id="${var_id}">
                        <span class="var-in-math-nickname">${nickname}</span>
                        <span class="var-in-math-id">${var_id}</span>
                    </span>
                </foreignObject>
            `;
        });

        // add comments to the TARGETs
        targetdoms.forEach(targetdom => {
            // extract target name
            var target_name = "";
            var i = 0;
            while (i < targetdom.children[1].querySelectorAll("use").length) {
                var c = parseInt(targetdom.children[1].querySelectorAll("use")[i].dataset.c, 16);
                if (isNaN(c)) break;
                target_name += String.fromCharCode(c >= 0x1D44E ? c - 0x1D3ED : c >= 127 ? c - 0x1D3F3 : c);
                i++;
            }
            // add foreignObject
            targetdom.innerHTML = `
                <foreignObject>
                    <span xmlns="http://www.w3.org/1999/xhtml" class="var-in-math target" data-target-name="${target_name}">
                        <span class="var-in-math-nickname">${target_name}</span>
                    </span>
                </foreignObject>
            `;
        });

        // Clear the element and append the SVG
        element.innerHTML = '';
        element.appendChild(svgNode);

        return Promise.resolve();
    } catch (error) {
        Noti.warning(t("MathJax Render Failed"), "Failed to render mathematical expression. Showing raw LaTeX instead.");
        console.error('MathJax rendering error:', error);
        // Fallback: show the LaTeX code
        element.innerHTML = `<code>$${latexExpression}$</code>`;
        throw error;
    }
}

/**
 * Convert MathJS expression to LaTeX and render it
 * @param {HTMLElement} element - The element to render the math in
 * @param {string} expression - The MathJS expression
 * @returns {Promise} Promise that resolves when rendering is complete
 */
async function renderMathExpression(element, expression, world=null) {
    const latex = expressionToLatex(expression, world);
    return renderMathJax(element, "=" + latex, world);
}

/**
 * Enhanced function mappings for better LaTeX conversion
 */
const functionMappings = {
    'sqrt': '\\sqrt',
    'sin': '\\sin',
    'cos': '\\cos',
    'tan': '\\tan',
    'log': '\\log',
    'ln': '\\ln',
    'exp': '\\exp',
    'abs': '\\left|',
    'pi': '\\pi',
    'e': 'e',
    'infinity': '\\infty'
};

/**
 * Enhance LaTeX output with better formatting
 * @param {string} latex - Raw LaTeX from MathJS
 * @returns {string} Enhanced LaTeX
 */
function enhanceLatex(latex) {
    let enhanced = latex;

    // Replace function names with proper LaTeX commands
    Object.entries(functionMappings).forEach(([mathjs, latexCmd]) => {
        const regex = new RegExp(`\\b${mathjs}\\b`, 'g');
        enhanced = enhanced.replace(regex, latexCmd);
    });

    // Handle absolute value properly
    enhanced = enhanced.replace(/\\left\|([^|]+)\\right\|/g, '\\left|$1\\right|');

    return enhanced;
}

/**
 * Create and manage a mathematical input component with display and edit modes
 * @param {HTMLElement} container - The container element for the math input
 * @param {Object} variable - The variable object with value, expression, and type
 * @param {boolean} disabled - Whether the input is disabled
 * @returns {Object} Object with methods to update and manage the math input
 */
function createMathInput(container, variable, disabled = false, onChange = null) {
    // Create the HTML structure
    container.innerHTML = `
        <div class="math-display-area ${disabled ? 'disabled' : ''}" id="mathdisplay"></div>
        <input type="text" class="math-input hidden" id="input" 
               value="=${variable.expression}" ${disabled ? "disabled" : ""} />
        <span class="variable-value-display" id="value">= ${variable.value}</span>
    `;

    const mathDisplay = container.querySelector(`#mathdisplay`);
    const input = container.querySelector(`#input`);
    const valueDisplay = container.querySelector(`#value`);

    let isEditing = false;

    // Initial render
    renderMathExpression(mathDisplay, variable.expression, variable.world).catch(() => {
        // Fallback if MathJax fails
        mathDisplay.innerHTML = `<code>=${variable.expression}</code>`;
    });

    // Function to update the value display
    function updateValueDisplay() {
        try {
            if (variable.value === null) {
                valueDisplay.textContent = "";
            } else {
                const currentValue = variable.value;
                valueDisplay.textContent = `= ${currentValue}`;
            }
        } catch (error) {
            valueDisplay.textContent = `= Error`;
            Noti.error(t('Failed to evaluate variable value') + ': ' + error.message);
            throw error;
        }
    }

    // Toggle between display and edit modes
    function toggleEditMode() {
        if (disabled) return;

        isEditing = !isEditing;

        if (isEditing) {
            var height = mathDisplay.getBoundingClientRect().height;
            input.style.height = height + 'px';
            mathDisplay.classList.add('hidden');
            input.classList.remove('hidden');
            valueDisplay.classList.add('hidden');
            input.focus();
        } else {
            mathDisplay.classList.remove('hidden');
            input.classList.add('hidden');
            valueDisplay.classList.remove('hidden');

            // Update the expression and re-render
            if (input.value.startsWith('=')) {
                const newExpression = input.value.slice(1);
                if (newExpression !== variable.expression) {
                    try {
                        variable.resetWithParams({
                            value: newExpression,
                            type: 'derived',
                        });

                        // Re-render the math
                        renderMathExpression(mathDisplay, newExpression, variable.world).catch(() => {
                            mathDisplay.innerHTML = `<code>=${newExpression}</code>`;
                        });

                        // Trigger onChange callback if provided
                        if (onChange && typeof onChange === 'function') {
                            onChange(variable, newExpression);
                        }
                    } catch (error) {
                        // If the expression is invalid, revert and show error
                        input.value = "=" + variable.expression;
                        Noti.error(t('Invalid expression'), error.message);
                    }
                }
            } else {
                variable.resetWithParams({
                    value: Number(input.value),
                    type: 'immediate',
                });

                renderMathExpression(mathDisplay, input.value, variable.world).catch(() => {
                    mathDisplay.innerHTML = `<code>=${input.value}</code>`;
                });

                // Trigger onChange callback if provided
                if (onChange && typeof onChange === 'function') {
                    onChange(variable, Number(input.value));
                }
            }

            // Update the value display
            updateValueDisplay();
        }
    }

    // Setup event listeners
    mathDisplay.addEventListener('click', toggleEditMode);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            toggleEditMode();
        } else if (e.key === 'Escape') {
            input.value = "=" + variable.expression; // Revert changes
            toggleEditMode();
        }
    });

    input.addEventListener('blur', () => {
        if (isEditing) {
            toggleEditMode();
        }
    });

    // Initial value display update
    updateValueDisplay();

    return {
        updateValueDisplay,
        toggleEditMode,
        isEditing: () => isEditing,
        elements: {
            mathDisplay,
            input,
            valueDisplay
        }
    };
}

/**
 * Initialize a math input for a derived variable with rendering and editing capabilities
 * @param {HTMLElement} container - The container element
 * @param {Object} variable - The variable object
 * @param {boolean} disabled - Whether the input is disabled
 * @returns {Object} Math input management object
 */
function initializeMathInput(container, variable, disabled = false, onChange = null) {
    if (variable.type !== 'derived') {
        throw new Error('Math input can only be used with derived variables');
    }

    return createMathInput(container, variable, disabled, onChange);
}

export {
    expressionToLatex,
    renderMathJax,
    renderMathExpression,
    enhanceLatex,
    createMathInput,
    initializeMathInput
};