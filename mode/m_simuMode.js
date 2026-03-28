import { globalWorld } from "../phy/World.js";
import { globalSimulation, SETTINGS } from "../sim/simulation.js";
import { $, $$ } from "./../utils.js";
import * as Noti from '../ui/notification/notification.js';
import { t } from "../i18n/i18n.js";
import { scheduleRender } from "../sim/render_frame.js";
import * as Inspector from "../ui/inspector.js";
import { monitor_phyobj, monitor_ui_section } from "../ui/monitor.js";
import { mainMenu, mkMenu } from "../ui/menu.js";
import { VarMon_reset, VarMon_add, VarMon_toggle_external_mode } from "../ui/var_monitor.js";

const simuMenu = [
    ...mainMenu,
    {
        title: t("Monit"),
        items: [
            {
                type: "submenu",
                title: t("Create Var Monitor"),
                action: function () {
                    VarMon_add({
                        id: Math.random(),
                        title: t("Untitled VarMon"),
                        exprX: "t",
                        ySeries: [{ name: "Y", expr: "undefined", color: "#1f77b4" }],
                        annoX: t("Time / s"),
                        annoY: t("Value"),
                        axis_match: false
                    });
                }
            },
            {
                type: "submenu",
                title: t("Open External Monitor"),
                action: function () {
                    VarMon_toggle_external_mode();
                }
            }
        ],
        style: {
            background: "linear-gradient(0deg, var(--color-600) -20%, var(--color-700) 70%)",
        }
    }
];

function initMode() {
    // init menu
    mkMenu(simuMenu);
    // init progress bar
    globalSimulation.clear();
    setProgress(globalSimulation.time / globalSimulation.maxTime, globalSimulation.maxTime);
    // switch from inspector -> monitor
    monitor_phyobj(globalWorld, Inspector.last_rendered_phyobj_id || null);
}

function deinitMode() {
    // stop animation
    toggleAnimation(false);

    // deinit menu
    mkMenu(mainMenu);

    return true;
}

const timeDisp = $("#sim-prog-time");
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
    if (isNaN(progress) || isNaN(max) || max <= 0) {
        timeDisp.textContent = `0.00s`;
        progressActual.style.width = "0%";
        progressThumb.style.left = "0%";
        return;
    }
    timeDisp.textContent = `${progress.toFixed(2)}s`;
    progressActual.style.width = (progress / max * 100) + "%";
    progressThumb.style.left = (progress / max * 100) + "%";
    // progressBar.value = progress;
    // progressBar.max = max;
    // progressBar.step = SETTINGS.dt;
}

function _rerenderFrame() {
    scheduleRender();
    monitor_ui_section.render();
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
    try {
        var last_backup_time = globalSimulation.simulate_to(globalSimulation.time + (frame_ms / 1000) * SETTINGS.aniSpeed, SETTINGS.dt, 0.1, start_time - last_backup_elapsed);
    } catch (e) {
        toggleAnimation(false);
        btnPlayPause.innerHTML = "▶"; // play icon
        Noti.error(t("Simulation Error"), e.message, null, 5000);
        throw e;
    }
    var end_time = performance.now();
    last_backup_elapsed = end_time - last_backup_time;

    // Adjust next frame timing (调整下一帧的定时/渲染策略)
    var elapsed = end_time - start_time; // 计算本帧物理模拟花费的真实时间
    
    // 判断当前设备性能是否跟不上默认帧率的要求 (1000 / aniFPS_Default 通常约 16.6ms)
    const needAdjustment = (elapsed * (bkupAniSpeed / SETTINGS.aniSpeed) >= 1000 / aniFPS_Default);
    
    if (needAdjustment) {
        // [策略1] 首先尝试降低帧率(FPS)来换取计算时间，勉强维持用户预设的播放速度
        var aniFPS_new = aniFPS_Default / (elapsed * (bkupAniSpeed / SETTINGS.aniSpeed) / (1000 / aniFPS_Default));
        // 限制最低帧率为 30 FPS，保证最基本的视觉动画流畅度
        aniFPS = Math.max(30, aniFPS_new);

        // 如果连降低到 30 FPS 都无法按时计算完，说明系统负载极高
        if (aniFPS !== aniFPS_new) {
            // [策略2] 此时只能强制降低物理模拟的播放速度 (Time Scale)
            SETTINGS.aniSpeed = (aniFPS_new / aniFPS_Default) * bkupAniSpeed;
            // 更新UI以显示被降级后的真实模拟播放倍速
            aspdControl.textContent = `⏭ ${SETTINGS.aniSpeed.toFixed(1)}x`;
        }
    } else {
        // 设备性能充足，恢复原本的默认最高帧率和用户的目标播放速度
        aniFPS = aniFPS_Default;
        SETTINGS.aniSpeed = bkupAniSpeed || 0;
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
    VarMon_reset();

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

export { initMode, deinitMode };