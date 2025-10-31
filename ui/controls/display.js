import { t } from "../../i18n/i18n.js";

function displayVector2Multi({ field, getVectors, disabled = false, onChange = null, size = 200 }) {
    var dom = document.createElement("div");
    dom.className = "display-vector2-multi-container";

    dom.innerHTML = `
        <b class="field-title ${field ? '' : 'hidden'}">${field}:</b>
        <div class="vector-multi-display">
            <div class="vector-multi-visual-area" id="visual"></div>
            <div class="vector-multi-info-area" id="info"></div>
        </div>
    `;

    const visualArea = dom.querySelector("#visual");
    const infoArea = dom.querySelector("#info");

    // Initialize the multi-vector visualization
    createMultiVectorVisualization(visualArea, infoArea, getVectors, disabled, onChange, size);

    return dom;
}

function createMultiVectorVisualization(visualArea, infoArea, getVectors, disabled, onChange = null, size = 200) {
    const SVG_SIZE = size;
    const CENTER = SVG_SIZE / 2;
    const MAX_VECTOR_LENGTH = SVG_SIZE * 0.4; // Maximum visual length of vector (40% of canvas)

    // Calculate dynamic display scale based on largest vector
    function calculateDisplayScale() {
        const vectors = getVectors();
        if (!vectors || vectors.length === 0) return 1;
        
        let maxMagnitude = 0;
        vectors.forEach(vector => {
            if (vector && vector.value) {
                const [x, y] = vector.value;
                const magnitude = calculateMagnitude(x, y);
                maxMagnitude = Math.max(maxMagnitude, magnitude);
            }
        });
        
        return maxMagnitude > 0 ? maxMagnitude / 5 : 1;
    }

    // Create SVG with grid and axes
    visualArea.innerHTML = `
        <svg width="${SVG_SIZE}" height="${SVG_SIZE}" class="vector-multi-svg ${disabled ? 'disabled' : ''}" style="border: 1px solid #ccc; border-radius: 4px;">
            <!-- Grid pattern -->
            <defs>
                <pattern id="grid_${visualArea.id}" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e8e8e8" stroke-width="0.5"/>
                </pattern>
                <pattern id="fine_grid_${visualArea.id}" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#f4f4f4" stroke-width="0.3"/>
                </pattern>
            </defs>
            
            <!-- Background grids -->
            <rect width="100%" height="100%" fill="url(#fine_grid_${visualArea.id})" />
            <rect width="100%" height="100%" fill="url(#grid_${visualArea.id})" />
            
            <!-- Coordinate axes -->
            <line x1="0" y1="${CENTER}" x2="${SVG_SIZE}" y2="${CENTER}" stroke="#999" stroke-width="1" opacity="0.7" />
            <line x1="${CENTER}" y1="0" x2="${CENTER}" y2="${SVG_SIZE}" stroke="#999" stroke-width="1" opacity="0.7" />
            
            <!-- Axis labels -->
            <text x="${SVG_SIZE - 10}" y="${CENTER - 5}" text-anchor="end" font-size="12" fill="#666">X</text>
            <text x="${CENTER + 5}" y="15" font-size="12" fill="#666">Y</text>
            
            <!-- Center point -->
            <circle cx="${CENTER}" cy="${CENTER}" r="3" fill="#333" />
            
            <!-- Vector container -->
            <g class="vectors-container"></g>
        </svg>
    `;

    const svg = visualArea.querySelector('.vector-multi-svg');
    const vectorsContainer = svg.querySelector('.vectors-container');

    // Helper functions
    function calculateMagnitude(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function calculateAngle(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    function vectorToScreenCoords(x, y, displayScale) {
        const magnitude = calculateMagnitude(x, y);

        // Apply display scaling
        const scaledX = x / displayScale;
        const scaledY = y / displayScale;
        const scaledMagnitude = magnitude / displayScale;

        // Scale mapping: 1 scaled unit = 15 pixels
        const directScale = 15;
        const directScreenMagnitude = scaledMagnitude * directScale;

        if (directScreenMagnitude <= MAX_VECTOR_LENGTH) {
            // Within direct mapping range
            return {
                x: CENTER + scaledX * directScale,
                y: CENTER - scaledY * directScale // Flip Y for screen coordinates
            };
        } else {
            // Beyond direct range: scale to fit within MAX_VECTOR_LENGTH
            const scale = MAX_VECTOR_LENGTH / directScreenMagnitude;
            return {
                x: CENTER + scaledX * directScale * scale,
                y: CENTER - scaledY * directScale * scale
            };
        }
    }

    function createArrowHead(x1, y1, x2, y2, color = "#f00") {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 10;
        const headAngle = Math.PI / 6;

        const x3 = x2 - headLength * Math.cos(angle - headAngle);
        const y3 = y2 - headLength * Math.sin(angle - headAngle);
        const x4 = x2 - headLength * Math.cos(angle + headAngle);
        const y4 = y2 - headLength * Math.sin(angle + headAngle);

        return `${x2},${y2} ${x3},${y3} ${x4},${y4}`;
    }

    function getVectorColor(nickname) {
        if (!nickname) {
            // Fallback colors for vectors without nicknames
            const defaultColors = [
                "#ff4444", "#4444ff", "#44ff44", "#ff44ff", 
                "#ffaa44", "#44ffff", "#aa44ff", "#ffff44",
                "#ff8888", "#8888ff", "#88ff88", "#ff88ff"
            ];
            return defaultColors[Math.floor(Math.random() * defaultColors.length)];
        }
        
        // Simple hash function to convert string to number
        let hash = 0;
        for (let i = 0; i < nickname.length; i++) {
            const char = nickname.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Get absolute value and convert to hex string
        const absHash = Math.abs(hash);
        let hexColor = absHash.toString(16);
        
        // Get first 6 digits, pad with zeros if needed
        hexColor = hexColor.padStart(6, '0').substring(0, 6);
        
        return `#${hexColor}`;
    }

    // Handle vector hover effects
    function handleVectorHover(vectorIndex, isHovering) {
        // Get the vector group in SVG
        const vectorGroup = vectorsContainer.querySelector(`.vector-${vectorIndex}`);
        if (vectorGroup) {
            if (isHovering) {
                // Scale up the vector
                vectorGroup.style.transformOrigin = "center";
                
                // Increase opacity and stroke width
                const vectorLine = vectorGroup.querySelector("line");
                const vectorLabel = vectorGroup.querySelector("text");
                
                if (vectorLine) {
                    vectorLine.setAttribute("stroke-width", "3");
                }
                if (vectorLabel) {
                    vectorLabel.setAttribute("font-size", "12");
                    vectorLabel.setAttribute("font-weight", "bold");
                }
            } else {
                // Reset opacity and stroke width
                const vectorLine = vectorGroup.querySelector("line");
                const vectorLabel = vectorGroup.querySelector("text");
                
                if (vectorLine) {
                    vectorLine.setAttribute("stroke-width", "2");
                }
                if (vectorLabel) {
                    vectorLabel.setAttribute("font-size", "10");
                    vectorLabel.setAttribute("font-weight", "normal");
                }
            }
        }

        // Highlight corresponding info panel item
        const vectorDetail = infoArea.querySelector(`[data-vector-index="${vectorIndex}"]`);
        if (vectorDetail) {
            if (isHovering) {
                vectorDetail.style.backgroundColor = "#f0f8ff";
                vectorDetail.style.transform = "scale(1.02)";
                vectorDetail.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                vectorDetail.style.transition = "all 0.2s ease";
                vectorDetail.style.borderRadius = "6px";
            } else {
                vectorDetail.style.backgroundColor = "";
                vectorDetail.style.boxShadow = "";
                vectorDetail.style.borderRadius = "";
            }
        }
    }

    function updateDisplay() {
        const vectors = getVectors();
        if (!vectors || vectors.length === 0) {
            vectorsContainer.innerHTML = '';
            infoArea.innerHTML = `<div class="no-vectors">${t("No vectors to display")}</div>`;
            return;
        }

        const displayScale = calculateDisplayScale();
        
        // Clear previous vectors
        vectorsContainer.innerHTML = '';

        // Create vector elements
        vectors.forEach((vector, index) => {
            if (!vector || !vector.value) return;

            const [x, y] = vector.value;
            const magnitude = calculateMagnitude(x, y);
            const angle = calculateAngle(x, y);
            const screenCoords = vectorToScreenCoords(x, y, displayScale);
            const color = getVectorColor(vector.nickname);
            // const color = getVectorColor(index, vectors.length);

            if (magnitude > 0.01) {
                // Create vector group
                const vectorGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                vectorGroup.setAttribute("class", `vector-${index}`);
                vectorGroup.setAttribute("data-vector-index", index);

                // Vector line
                const vectorLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                vectorLine.setAttribute("x1", CENTER);
                vectorLine.setAttribute("y1", CENTER);
                vectorLine.setAttribute("x2", screenCoords.x);
                vectorLine.setAttribute("y2", screenCoords.y);
                vectorLine.setAttribute("stroke", color);
                vectorLine.setAttribute("stroke-width", "2");

                // Vector head
                const vectorHead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                vectorHead.setAttribute("points", createArrowHead(CENTER, CENTER, screenCoords.x, screenCoords.y, color));
                vectorHead.setAttribute("fill", color);

                // Vector label (show magnitude and name if available)
                const labelX = screenCoords.x + (screenCoords.x > CENTER ? 10 : -30);
                const labelY = screenCoords.y + (screenCoords.y > CENTER ? 15 : -5);
                
                const vectorLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
                vectorLabel.setAttribute("x", labelX);
                vectorLabel.setAttribute("y", labelY);
                vectorLabel.setAttribute("font-size", "10");
                vectorLabel.setAttribute("fill", color);
                vectorLabel.setAttribute("font-weight", "bold");
                vectorLabel.textContent = vector.nickname ? `${vector.nickname}: ${magnitude.toFixed(2)}` : `${t("Vector")}${index + 1}: ${magnitude.toFixed(2)}`;

                // Add hover event listeners
                vectorGroup.addEventListener("mouseenter", () => handleVectorHover(index, true));
                vectorGroup.addEventListener("mouseleave", () => handleVectorHover(index, false));

                vectorGroup.appendChild(vectorLine);
                vectorGroup.appendChild(vectorHead);
                vectorGroup.appendChild(vectorLabel);
                vectorsContainer.appendChild(vectorGroup);
            }
        });

        // Update info area
        updateInfoArea(vectors);
    }

    function updateInfoArea(vectors) {
        if (!vectors || vectors.length === 0) {
            infoArea.innerHTML = `<div class="no-vectors">${t("No vectors to display")}</div>`;
            return;
        }

        let infoHTML = '<div class="vector-multi-info">';
        
        // Add summary statistics
        const totalVectors = vectors.filter(v => v && v.value).length;
        let totalMagnitude = 0;
        let avgAngle = 0;
        
        vectors.forEach(vector => {
            if (vector && vector.value) {
                const [x, y] = vector.value;
                totalMagnitude += calculateMagnitude(x, y);
                avgAngle += calculateAngle(x, y);
            }
        });
        
        avgAngle = totalVectors > 0 ? avgAngle / totalVectors : 0;

        infoHTML += `
            <div class="vector-summary">
                <h4>${t("Vector Summary")}</h4>
                <div class="summary-stats">
                    <span><strong>${t("Count")}:</strong> ${totalVectors}</span>
                </div>
            </div>
        `;

        // Add individual vector details
        infoHTML += '<div class="vector-details">';
        vectors.forEach((vector, index) => {
            if (!vector || !vector.value) return;

            const [x, y] = vector.value;
            const magnitude = calculateMagnitude(x, y);
            const angle = calculateAngle(x, y);
            const color = getVectorColor(vector.nickname);
            // const color = getVectorColor(index, vectors.length);

            infoHTML += `
                <div class="vector-detail" style="border-left: 3px solid ${color};" data-vector-index="${index}">
                    <div class="vector-name">
                        <svg width="2.5rem" height="2.5rem" viewBox="0 0 80 80" class="vector-arrow">
                            <defs>
                                <marker id="arrowhead_${index}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" fill="${color}">
                                    <polygon points="0 0, 6 3, 0 6" />
                                </marker>
                            </defs>
                            <!-- Rotated arrow pointing in vector direction -->
                            <g transform="rotate(${-angle} 40 40)">
                                <line x1="10" y1="40" x2="70" y2="40" stroke="${color}" stroke-width="2.5" marker-end="url(#arrowhead_${index})" />
                            </g>
                        </svg>
                        <b>${vector.nickname || `${t("Vector")} ${index + 1}`}</b>
                        <span style="font-weight: normal; font-size: 0.8em;">(${x.toFixed(2)}, ${y.toFixed(2)})</span>
                    </div>
                    <div class="vector-polar">
                        <span><strong>${t("Magnitude")}:</strong> ${magnitude.toFixed(2)}</span>
                        <span><strong>${t("Angle")}:</strong> ${angle.toFixed(1)}°</span>
                    </div>
                </div>
            `;
        });
        infoHTML += '</div></div>';

        infoArea.innerHTML = infoHTML;

        // Add hover event listeners to vector details in info area
        const vectorDetails = infoArea.querySelectorAll('.vector-detail[data-vector-index]');
        vectorDetails.forEach(detail => {
            const vectorIndex = parseInt(detail.getAttribute('data-vector-index'));
            
            detail.addEventListener("mouseenter", () => handleVectorHover(vectorIndex, true));
            detail.addEventListener("mouseleave", () => handleVectorHover(vectorIndex, false));
        });
    }

    // Initial display update
    updateDisplay();

    // Return public interface for external updates
    return {
        updateDisplay: updateDisplay,
        refresh: updateDisplay
    };
}

export { displayVector2Multi };