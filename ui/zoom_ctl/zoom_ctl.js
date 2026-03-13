import { scheduleRender, setZoomLevel } from "../../sim/render_frame.js";

class ZoomControl {
    constructor() {
        this.minZoom = 10;
        this.maxZoom = 500;
        this.centerZoom = 100; // 中心点
        this.currentZoom = 100;
        this.step = 10; // 调整步长

        this.element = null;
        this.sliderContainer = null;
        this.slider = null;
        this.sliderThumb = null;
        this.percentageDisplay = null;
        this.minusBtn = null;
        this.plusBtn = null;
        this.scaleRuler = document.getElementById("scale-ruler");
        this.rulerMinPixels = 60;
        this.rulerMaxPixels = 80;
        this.rulerTargetPixels = 70;

        this.isDragging = false;

        this.init();
    }

    init() {
        this.createElement();
        this.bindEvents();
        this.updateDisplay();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'zoom-control';
        this.element.id = 'zoom-control';

        // Minus button
        this.minusBtn = document.createElement('span');
        this.minusBtn.className = 'zoom-btn zoom-minus button';
        this.minusBtn.innerHTML = '−';
        this.minusBtn.title = 'Zoom Out';

        // Slider container
        this.sliderContainer = document.createElement('div');
        this.sliderContainer.className = 'zoom-slider-container';

        this.slider = document.createElement('div');
        this.slider.className = 'zoom-slider';

        this.sliderThumb = document.createElement('div');
        this.sliderThumb.className = 'zoom-slider-thumb';

        this.slider.appendChild(this.sliderThumb);
        this.sliderContainer.appendChild(this.slider);

        // Plus button
        this.plusBtn = document.createElement('span');
        this.plusBtn.className = 'zoom-btn zoom-plus button';
        this.plusBtn.innerHTML = '+';
        this.plusBtn.title = 'Zoom In';

        // Percentage display
        this.percentageDisplay = document.createElement('span');
        this.percentageDisplay.className = 'zoom-percentage button';
        this.percentageDisplay.title = 'Click to reset to 100%';

        // Assemble the control
        this.element.appendChild(this.minusBtn);
        this.element.appendChild(this.sliderContainer);
        this.element.appendChild(this.plusBtn);
        this.element.appendChild(this.percentageDisplay);
    }

    // 将缩放值转换为滑块位置百分比 (0-1)
    zoomToSliderPosition(zoom) {
        if (zoom <= this.centerZoom) {
            // 左半部分：10%-100% 映射到 0-0.5
            return (zoom - this.minZoom) / (this.centerZoom - this.minZoom) * 0.5;
        } else {
            // 右半部分：100%-500% 映射到 0.5-1
            return 0.5 + (zoom - this.centerZoom) / (this.maxZoom - this.centerZoom) * 0.5;
        }
    }

    // 将滑块位置百分比转换为缩放值
    sliderPositionToZoom(position) {
        if (position <= 0.5) {
            // 左半部分
            return this.minZoom + (position / 0.5) * (this.centerZoom - this.minZoom);
        } else {
            // 右半部分
            return this.centerZoom + ((position - 0.5) / 0.5) * (this.maxZoom - this.centerZoom);
        }
    }

    bindEvents() {
        // Button events
        this.minusBtn.addEventListener('click', () => this.zoomOut());
        this.plusBtn.addEventListener('click', () => this.zoomIn());

        // Percentage click to reset
        this.percentageDisplay.addEventListener('click', () => this.resetZoom());

        // Slider events
        this.sliderContainer.addEventListener('mousedown', (e) => this.handleSliderMouseDown(e));
        this.sliderThumb.addEventListener('mousedown', (e) => this.handleThumbMouseDown(e));

        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        // Prevent context menu on slider
        this.sliderContainer.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleSliderMouseDown(e) {
        if (e.target === this.slider || e.target === this.sliderContainer) {
            const rect = this.slider.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const sliderPosition = Math.max(0, Math.min(1, x / rect.width));
            const newZoom = this.sliderPositionToZoom(sliderPosition);
            this.setZoom(newZoom);
        }
    }

    handleThumbMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = true;
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const rect = this.slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const sliderPosition = Math.max(0, Math.min(1, x / rect.width));
        const newZoom = this.sliderPositionToZoom(sliderPosition);
        this.setZoom(newZoom);
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    zoomIn() {
        var newZoom = Math.min(this.maxZoom, this.currentZoom + this.step);
        this.setZoom(newZoom - newZoom%10);
    }

    zoomOut() {
        var newZoom = Math.max(this.minZoom, this.currentZoom - this.step);
        this.setZoom(newZoom - newZoom%10);
    }

    resetZoom() {
        this.setZoom(this.centerZoom); // 重置到中心点100%
    }

    setZoom(zoom) {
        this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
        this.updateDisplay();
        this.onZoomChange(this.currentZoom);
    }

    updateDisplay() {
        // Update percentage display
        this.percentageDisplay.textContent = Math.round(this.currentZoom) + '%';

        // Update slider position using the dual-scale mapping
        const sliderPosition = this.zoomToSliderPosition(this.currentZoom);
        this.sliderThumb.style.left = (sliderPosition * 100) + '%';

        // Update button states
        this.minusBtn.disabled = this.currentZoom <= this.minZoom;
        this.plusBtn.disabled = this.currentZoom >= this.maxZoom;

        // Update scale ruler
        this.updateScaleRuler();
    }

    _getPixelsPerMeter() {
        return this.currentZoom / 10;
    }

    _pickScaleUnitMeters() {
        const pixelsPerMeter = this._getPixelsPerMeter();
        const multipliers = [1, 2, 5];
        const inRangeCandidates = [];
        let closestCandidate = null;

        for (let exponent = -3; exponent <= 12; exponent++) {
            const base = Math.pow(10, exponent);
            for (const multiplier of multipliers) {
                const meters = multiplier * base;
                const pixels = meters * pixelsPerMeter;
                const distanceToTarget = Math.abs(pixels - this.rulerTargetPixels);

                const candidate = { meters, pixels, distanceToTarget, multiplier, baseMeters: base };

                if (!closestCandidate || distanceToTarget < closestCandidate.distanceToTarget) {
                    closestCandidate = candidate;
                }

                if (pixels >= this.rulerMinPixels && pixels <= this.rulerMaxPixels) {
                    inRangeCandidates.push(candidate);
                }
            }
        }

        if (inRangeCandidates.length > 0) {
            inRangeCandidates.sort((a, b) => a.distanceToTarget - b.distanceToTarget);
            return inRangeCandidates[0];
        }

        return closestCandidate;
    }

    _formatScaleLabel(meters) {
        if (meters >= 1000) {
            const kilometers = meters / 1000;
            const text = Number.isInteger(kilometers) ? kilometers.toString() : kilometers.toPrecision(3).replace(/\.0+$/, '');
            return text + 'km';
        }

        const meterText = Number.isInteger(meters) ? meters.toString() : meters.toPrecision(3).replace(/\.0+$/, '');
        return meterText + 'm';
    }

    updateScaleRuler() {
        if (!this.scaleRuler) return;

        const scale = this._pickScaleUnitMeters();
        if (!scale) return;

        this.scaleRuler.innerHTML = '';

        const bar = document.createElement('div');
        bar.className = 'scale-ruler-bar';
        bar.style.width = scale.pixels + 'px';

        if (scale.multiplier === 2 || scale.multiplier === 5) {
            for (let stepIndex = 1; stepIndex < scale.multiplier; stepIndex++) {
                const splitter = document.createElement('div');
                splitter.className = 'scale-ruler-splitter';
                splitter.style.left = (stepIndex / scale.multiplier * 100) + '%';
                bar.appendChild(splitter);
            }
        }

        const label = document.createElement('div');
        label.className = 'scale-ruler-label';
        label.textContent = this._formatScaleLabel(scale.meters);

        this.scaleRuler.appendChild(bar);
        this.scaleRuler.appendChild(label);
    }

    onZoomChange(zoom) {
        setZoomLevel(zoom / 100 * 10);
        scheduleRender();
    }

    getZoomFactor() {
        return this.currentZoom / 100;
    }

    getElement() {
        return this.element;
    }
}

// Export for module usage
export { ZoomControl };
