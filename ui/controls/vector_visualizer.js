/**
 * Interactive Vector Visualizer Component
 * Provides drag and rotate functionality for 2D vectors
 * Extracted from the original input_controls.js implementation
 */

import { t } from "../../i18n/i18n.js";

function revY(y) {
    return y;
}

export function createVectorVisualization(visualArea, infoArea, variable, disabled, onChange = null) {
    const SVG_SIZE = 120;
    const CENTER = SVG_SIZE / 2;
    const MAX_VECTOR_LENGTH = 45; // Maximum visual length of vector
    
    // Calculate initial display scale: initial vector length / 5
    const initialVector = getVectorValue();
    const initialLength = calculateMagnitude(initialVector[0], initialVector[1]);
    const DISPLAY_SCALE = initialLength > 0 ? initialLength / 5 : 1;

    // Create SVG
    visualArea.innerHTML = `
        <svg width="${SVG_SIZE}" height="${SVG_SIZE}" class="vector2-svg ${disabled ? 'disabled' : ''}"  style="border: 1px solid #ccc; border-radius: 4px;">
            <!-- Grid lines -->
            <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Center point -->
            <circle cx="${CENTER}" cy="${CENTER}" r="2" fill="#666" />
            
            <!-- Angle arc -->
            <path class="angle-arc" stroke="#00f" stroke-width="1" fill="none" />
            
            <!-- Vector arrow -->
            <g class="vector-group">
                <line class="vector-line" x1="${CENTER}" y1="${CENTER}" x2="${CENTER}" y2="${CENTER}" stroke="#f00" stroke-width="2" />
                <polygon class="vector-head" fill="#f00" />
            </g>
            
            <!-- Vector length label -->
            <text class="length-label" x="${CENTER}" y="15" text-anchor="middle" font-size="10" fill="#000"></text>
            
            <!-- Angle label -->
            <text class="angle-label" x="${CENTER + 15}" y="${CENTER - 5}" font-size="10" fill="#00f"></text>

        </svg>
    `;

    // Create info display
    infoArea.innerHTML = `
        <div class="vector2-info">
            <div class="vector2-coords">
                <label>${t("X")}: <input type="number" class="coord-input coord-x" step="0.1" ${disabled ? 'disabled' : ''} /></label>
                <label>${t("Y")}: <input type="number" class="coord-input coord-y" step="0.1" ${disabled ? 'disabled' : ''} /></label>
            </div>
            <div class="vector2-polar">
                <label>${t("Len")}: <input type="number" class="magnitude-input" step="0.1" min="0" ${disabled ? 'disabled' : ''} /></label>
                <label>${t("α")}: <input type="number" class="angle-input" step="1" ${disabled ? 'disabled' : ''} />°</label>
            </div>
        </div>
    `;

    // Get DOM elements
    const svg = visualArea.querySelector('.vector2-svg');
    const vectorGroup = svg.querySelector('.vector-group');
    const vectorLine = svg.querySelector('.vector-line');
    const vectorHead = svg.querySelector('.vector-head');
    const angleArc = svg.querySelector('.angle-arc');
    const lengthLabel = svg.querySelector('.length-label');
    const angleLabel = svg.querySelector('.angle-label');

    const coordXInput = infoArea.querySelector('.coord-x');
    const coordYInput = infoArea.querySelector('.coord-y');
    const magnitudeInput = infoArea.querySelector('.magnitude-input');
    const angleInput = infoArea.querySelector('.angle-input');

    // State
    let isDragging = false;
    let isRotating = false;

    // Helper functions
    function getVectorValue() {
        return variable.value || [0, 0];
    }

    function setVectorValue(x, y) {
        variable.value = [x, y];
        updateDisplay();
    }

    function calculateMagnitude(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function calculateAngle(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    function vectorToScreenCoords(x, y) {
        const magnitude = calculateMagnitude(x, y);
        
        // Apply display scaling: show vector at 1/5 of its initial length
        const scaledX = x / DISPLAY_SCALE;
        const scaledY = y / DISPLAY_SCALE;
        const scaledMagnitude = magnitude / DISPLAY_SCALE;
        
        // Direct mapping scale: 1 scaled unit = 10 pixels
        const directScale = 10;
        const directScreenMagnitude = scaledMagnitude * directScale;
        
        if (directScreenMagnitude <= MAX_VECTOR_LENGTH) {
            // Within direct mapping range
            return {
                x: CENTER + scaledX * directScale,
                y: CENTER + revY(-scaledY * directScale)
            };
        } else {
            // Beyond direct range: scale to fit within MAX_VECTOR_LENGTH
            const scale = MAX_VECTOR_LENGTH / directScreenMagnitude;
            return {
                x: CENTER + scaledX * directScale * scale,
                y: CENTER + revY(-scaledY * directScale * scale)
            };
        }
    }

    function screenToVectorCoords(screenX, screenY) {
        const dx = screenX - CENTER;
        const dy = revY(-screenY) - revY(-CENTER);  // Flip Y back
        const screenMagnitude = calculateMagnitude(dx, dy);
        
        // Direct inverse of vectorToScreenCoords logic
        const directScale = 10;  // 1 scaled unit = 10 pixels
        
        // First, get the "scaled" vector coordinates (displayed coordinates)
        const scaledX = dx / directScale;
        const scaledY = dy / directScale;
        
        let finalScaledX, finalScaledY;
        
        if (screenMagnitude <= MAX_VECTOR_LENGTH) {
            // Within direct mapping range: no additional scaling needed
            finalScaledX = scaledX;
            finalScaledY = scaledY;
        } else {
            // Beyond MAX_VECTOR_LENGTH: the screen coordinates were scaled down
            // So we need to scale the vector coordinates back up
            const scaleFactor = screenMagnitude / MAX_VECTOR_LENGTH;
            finalScaledX = scaledX * scaleFactor;
            finalScaledY = scaledY * scaleFactor;
        }
        
        // Convert back from scaled coordinates to actual vector coordinates
        return {
            // Convert back from display scale to actual vector coordinates
            x: finalScaledX * DISPLAY_SCALE,
            y: finalScaledY * DISPLAY_SCALE
        };
    }

    function createArrowHead(x1, y1, x2, y2) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 8;
        const headAngle = Math.PI / 6;

        const x3 = x2 - headLength * Math.cos(angle - headAngle);
        const y3 = y2 - headLength * Math.sin(angle - headAngle);
        const x4 = x2 - headLength * Math.cos(angle + headAngle);
        const y4 = y2 - headLength * Math.sin(angle + headAngle);

        return `${x2},${y2} ${x3},${y3} ${x4},${y4}`;
    }

    function updateDisplay() {
        const [x, y] = getVectorValue();
        const magnitude = calculateMagnitude(x, y);
        const angle = calculateAngle(x, y);

        // Update screen coordinates
        const screenCoords = vectorToScreenCoords(x, y);

        // Update vector line
        vectorLine.setAttribute('x2', screenCoords.x);
        vectorLine.setAttribute('y2', screenCoords.y);

        // Update arrow head
        if (magnitude > 0.01) {
            vectorHead.setAttribute('points', createArrowHead(CENTER, CENTER, screenCoords.x, screenCoords.y));
            vectorHead.style.display = 'block';
        } else {
            vectorHead.style.display = 'none';
        }

        // Update angle arc
        if (magnitude > 0.01) {
            const arcRadius = 20;
            const startAngle = 0;
            const endAngle = angle * Math.PI / 180;

            const startX = CENTER + arcRadius * Math.cos(startAngle);
            const startY = CENTER - arcRadius * Math.sin(startAngle);
            const endX = CENTER + arcRadius * Math.cos(endAngle);
            const endY = CENTER - arcRadius * Math.sin(endAngle);

            const largeArcFlag = Math.abs(endAngle) > Math.PI ? 1 : 0;
            const sweepFlag = endAngle < 0 ? 1 : 0;

            angleArc.setAttribute('d', `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`);
            angleArc.style.display = 'block';
        } else {
            angleArc.style.display = 'none';
        }

        // Update labels
        lengthLabel.textContent = magnitude.toFixed(2);
        angleLabel.textContent = angle.toFixed(1) + '°';

        // Update input fields
        coordXInput.value = x.toFixed(2);
        coordYInput.value = y.toFixed(2);
        
        // Update polar coordinate inputs
        magnitudeInput.value = magnitude.toFixed(2);
        angleInput.value = angle.toFixed(1);
    }

    // Event handlers
    function handleMouseDown(e) {
        if (disabled) return;

        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if clicking near the vector head (for rotation)
        const [x, y] = getVectorValue();
        const screenCoords = vectorToScreenCoords(x, y);
        const distToHead = calculateMagnitude(mouseX - screenCoords.x, mouseY - screenCoords.y);

        if (distToHead < 15 && calculateMagnitude(x, y) > 0.01) {
            isDragging = true;
            svg.style.cursor = 'move';
        } else {
            isRotating = true;
            svg.style.cursor = 'crossair';
        }

        e.preventDefault();
    }

    function handleMouseMove(e) {
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (!isDragging && !isRotating) {
            const [x, y] = getVectorValue();
            const screenCoords = vectorToScreenCoords(x, y);
            const distToHead = calculateMagnitude(mouseX - screenCoords.x, mouseY - screenCoords.y);
            if (distToHead < 15 && calculateMagnitude(x, y) > 0.01) {
                svg.style.cursor = 'move';
            } else {
                svg.style.cursor = 'crosshair';
            }
            return;
        }

        if (isDragging) {
            // Direct dragging - set vector end to mouse position
            const newCoords = screenToVectorCoords(mouseX, mouseY);
            setVectorValue(newCoords.x, newCoords.y);
        } else if (isRotating) {
            // Rotation - maintain magnitude, change angle
            const [x, y] = getVectorValue();
            const magnitude = calculateMagnitude(x, y);
            const dx = mouseX - CENTER;
            const dy = revY(-mouseY) - revY(-CENTER);
            const newAngle = Math.atan2(dy, dx);

            const newX = magnitude * Math.cos(newAngle);
            const newY = magnitude * Math.sin(newAngle);
            setVectorValue(newX, newY);
        }
    }

    function handleMouseUp() {
        isDragging = false;
        isRotating = false;
        svg.style.cursor = 'default';
        
        // Trigger onChange callback if provided
        if (onChange && typeof onChange === 'function') {
            // onChange();
        }
    }

    function handleInputChange() {
        if (disabled) return;

        const x = parseFloat(coordXInput.value) || 0;
        const y = parseFloat(coordYInput.value) || 0;
        setVectorValue(x, y);
    }

    function handleMagnitudeChange() {
        if (disabled) return;

        const newMagnitude = parseFloat(magnitudeInput.value) || 0;
        const [x, y] = getVectorValue();
        const currentMagnitude = calculateMagnitude(x, y);
        
        if (currentMagnitude > 0) {
            // Keep the same direction, change magnitude
            const scale = newMagnitude / currentMagnitude;
            setVectorValue(x * scale, y * scale);
        } else {
            // If no current vector, create one pointing right
            setVectorValue(newMagnitude, 0);
        }
    }

    function handleAngleChange() {
        if (disabled) return;

        const newAngle = parseFloat(angleInput.value) || 0;
        const [x, y] = getVectorValue();
        const magnitude = calculateMagnitude(x, y);
        
        // Convert angle to radians and create new vector
        const radians = newAngle * Math.PI / 180;
        const newX = magnitude * Math.cos(radians);
        const newY = magnitude * Math.sin(radians);
        setVectorValue(newX, newY);
    }

    // Attach event listeners
    if (!disabled) {
        svg.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        coordXInput.addEventListener('input', handleInputChange);
        coordYInput.addEventListener('input', handleInputChange);
        magnitudeInput.addEventListener('input', handleMagnitudeChange);
        angleInput.addEventListener('input', handleAngleChange);
    }

    // Initial display update
    updateDisplay();

    // Return public interface
    return {
        updateDisplay
    };
}