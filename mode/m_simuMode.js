import { globalSimulation, SETTINGS } from "../sim/simulation.js";
import { $, $$ } from "./../utils.js";
import * as Noti from '../ui/notification/notification.js';
import { t } from "../i18n/i18n.js";
import { render_frame } from "../sim/render_frame.js";
import { monitor_ui_section } from "../ui/monitor.js";

const progressFull = $("#sim-prog-full");
const progressActual = $("#sim-prog-actual");
const progressThumb = $("#sim-prog-thumb");
// const progressBar = $("#sim-prog-slider");
const btnReset = $("#sim-ctl-reset");
const btnPlayPause = $("#sim-ctl-play-pause");
const aspdControl = $("#aspd-control");

var isAnimationRunning = false;
var isDragging = false;
var bkupAniSpeed = null;
var bkupAniSpeedText = null;
const aniFPS_Default = 60;
var aniFPS = 60;

function setProgress(progress, max) {
    progressActual.style.width = (progress / max * 100) + "%";
    progressThumb.style.left = (progress / max * 100) + "%";
    // progressBar.value = progress;
    // progressBar.max = max;
    // progressBar.step = SETTINGS.dt;
}

function _rerenderFrame() {
    render_frame();
    monitor_ui_section.render();
}

function initMode() {
    // init progress bar
    globalSimulation.clear();
    setProgress(globalSimulation.time / globalSimulation.maxTime, globalSimulation.maxTime);
}

function toggleAnimation(shouldRun) {
    isAnimationRunning = shouldRun;
    if (shouldRun) {
        bkupAniSpeed = SETTINGS.aniSpeed;
        bkupAniSpeedText = aspdControl.textContent;
    } else {
        SETTINGS.aniSpeed = bkupAniSpeed;
        aspdControl.textContent = bkupAniSpeedText;
    }
}

var last_backup_elapsed = 0;
function simuLoop(frame_ms) {
    if (!isAnimationRunning) return;

    var start_time = performance.now();
    var last_backup_time = globalSimulation.simulate_to(globalSimulation.time + (frame_ms / 1000) * SETTINGS.aniSpeed, SETTINGS.dt, 0.1, start_time-last_backup_elapsed);
    var end_time = performance.now();
    last_backup_elapsed = end_time - last_backup_time;

    // Adjust next frame timing
    var elapsed = end_time - start_time;
    const needAdjustment = (elapsed * (bkupAniSpeed / SETTINGS.aniSpeed) >= 1000 / aniFPS_Default);
    if (needAdjustment) {
        // adjust aniFPS first
        var aniFPS_new = aniFPS_Default / (elapsed * (bkupAniSpeed / SETTINGS.aniSpeed) / (1000 / aniFPS_Default));
        aniFPS = Math.max(30, aniFPS_new);

        if (aniFPS !== aniFPS_new) {
            // need further adjust SETTINGS.aniSpeed
            SETTINGS.aniSpeed = (aniFPS / aniFPS_Default) * bkupAniSpeed;
            aspdControl.textContent = `⏭ ${SETTINGS.aniSpeed.toFixed(1)}x`;
        }
    } else {
        aniFPS = aniFPS_Default;
        SETTINGS.aniSpeed = bkupAniSpeed;
        aspdControl.textContent = `⏭ ${SETTINGS.aniSpeed.toFixed(1)}x`;
    }
}

// animation fps
setInterval(() => {
    if (isAnimationRunning) {
        // Step ONE: render current frame
        _rerenderFrame();

        setProgress(globalSimulation.time, globalSimulation.maxTime);

        // Step TWO: simulate next frame
        simuLoop(1000 / aniFPS);
    }
}, 1000 / aniFPS);

// custom slider behavior
progressThumb.onmousedown = function (e) {
    isDragging = true;
    e.preventDefault();
}

document.addEventListener("mousemove", function (e) {
    if (isDragging) {
        const rect = progressFull.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const newProgress = Math.min(Math.max(offsetX / rect.width, 0), 1);
        setProgress(newProgress * globalSimulation.maxTime, globalSimulation.maxTime);

        globalSimulation.simulate_to(newProgress * globalSimulation.maxTime);
        _rerenderFrame();
    }
});

document.addEventListener("mouseup", function () {
    isDragging = false;
});

// buttons events
btnReset.onclick = function () {
    toggleAnimation(false);
    btnPlayPause.innerHTML = "▶"; // play icon

    globalSimulation.restore_backup(0);
    globalSimulation.clear();

    setProgress(0, globalSimulation.maxTime);
    _rerenderFrame();
    
    Noti.info(t("Simulation Reset"), t("The simulation has been reset to the initial state."), null, 3000);
}

btnPlayPause.onclick = function () {
    if (isAnimationRunning === true) {
        toggleAnimation(false);
        btnPlayPause.innerHTML = "▶"; // play icon
    } else {
        toggleAnimation(true);
        btnPlayPause.innerHTML = "❚❚"; // pause icon
    }
}

export { initMode };