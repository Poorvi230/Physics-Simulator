// --- DOM Elements ---
var elVelocity = document.getElementById('velocity');
var elAngle = document.getElementById('angle');
var elHeight = document.getElementById('height');

var valVelocity = document.getElementById('velocityValue');
var valAngle = document.getElementById('angleValue');
var valHeight = document.getElementById('heightValue');

const canvas = document.getElementById('canvas') || document.getElementById('simCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const btnLaunch = document.getElementById('launchBtn');
const btnReset = document.getElementById('resetBtn');
const selTheme = document.getElementById('themeSelect');
const selExperiment = document.getElementById('experimentSelect');

// New Environmental Controls
var selGravity = document.getElementById('gravitySelect');
var elDrag = document.getElementById('drag');
var elWind = document.getElementById('wind');
const valDrag = document.getElementById('dragValue');
const valWind = document.getElementById('windValue');

// --- Simulation State & Settings ---
window.loopId = null;
window.active = false;
window.shmType = 'linear';
window.simHistory = []; 
window.simTime = 0;

window.mx = 0;
window.my = 0;
window.vx = 0;
window.vy = 0;

window.cxZero = 0;
window.cyZero = 0;
window.pxPerUnitX = 1;
window.pxPerUnitY = 1;

const TIMESTEP = 0.02; 

let scaleX = 100;
let scaleY = 60;

const padLeft = 70;
const padBottom = 360;
const viewW = 600; 
const viewH = 280;

const themePalettes = {
    space: { line: '#38bdf8', txt: '#7dd3fc', primary: '#0ea5e9', trace: 'rgba(56, 189, 248, 0.4)' },
    neon:  { line: '#39ff14', txt: '#ccff00', primary: '#ffff00', trace: 'rgba(255, 255, 0, 0.4)' },
    retro: { line: '#d2b48c', txt: '#f5deb3', primary: '#ff7f50', trace: 'rgba(255, 127, 80, 0.4)' }
};
let activeTheme = themePalettes.space;

function getXPixel(metersX) {
    const scaleX = isFinite(window.pxPerUnitX) ? window.pxPerUnitX : 1;
    return window.cxZero + (metersX * scaleX);
}

function getYPixel(metersY) {
    const scaleY = isFinite(window.pxPerUnitY) ? window.pxPerUnitY : 1;
    return window.cyZero - (metersY * scaleY);
}

// --- Layout Core Renderers ---
function drawGridSystem() {
    if (!ctx) return;
    ctx.strokeStyle = activeTheme.line;
    ctx.fillStyle = activeTheme.txt;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(padLeft, padBottom);
    ctx.lineTo(padLeft, 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padLeft, padBottom);
    ctx.lineTo(padLeft + viewW, padBottom);
    ctx.stroke();

    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i <= 5; i++) {
        let ratio = i / 5;
        let metric = ratio * scaleX;
        let px = padLeft + ratio * viewW;

        ctx.beginPath();
        ctx.moveTo(px, padBottom - 2);
        ctx.lineTo(px, padBottom + 5);
        ctx.stroke();
        ctx.fillText(Math.round(metric), px, padBottom + 8);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 5; i++) {
        let ratio = i / 5;
        let metric = ratio * scaleY;
        let py = padBottom - ratio * viewH;

        ctx.beginPath();
        ctx.moveTo(padLeft - 5, py);
        ctx.lineTo(padLeft + 2, py);
        ctx.stroke();
        ctx.fillText(Math.round(metric), padLeft - 12, py);
    }

    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Distance (m)', padLeft + (viewW / 2), padBottom + 26);

    ctx.save();
    ctx.translate(20, padBottom - (viewH / 2));
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Height (m)', 0, 0);
    ctx.restore();
}

function drawProjectileTrack() {
    if (!ctx || !window.simHistory || !Array.isArray(window.simHistory) || window.simHistory.length === 0) {
        return; 
    }
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = (typeof activeTheme !== 'undefined' && activeTheme && activeTheme.chartLine) ? activeTheme.chartLine: "#f791c4";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < window.simHistory.length; i++) {
        const pt = window.simHistory[i];
        if (!pt || pt.length < 2) continue; 

        const cx = getXPixel(pt[0]);
        const cy = getYPixel(pt[1]);

        if (!isFinite(cx) || !isFinite(cy)) continue;

        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.restore();
}

function renderBallObject(metersX, metersY) {
    if (!ctx) return;
    if(!isFinite(metersX) || !isFinite(metersY)) {
        const elHeight = document.getElementById('height');
        metersY = elHeight ? Number(elHeight.value) : 0;
    }
    let px = getXPixel(metersX);
    let py = getYPixel(metersY);

    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);

    let grad = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 8);
    grad.addColorStop(0, '#ffffff');
    
    const ballColor = (activeTheme && activeTheme.primary) ? activeTheme.primary : '#ff5722';
    grad.addColorStop(1, ballColor);
    
    ctx.fillStyle = grad;
    ctx.fill();
}

function refreshDisplay() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selTheme) {
        activeTheme = themePalettes[selTheme.value] || themePalettes.space; 
    }

    const isSHM = (selExperiment && selExperiment.value === 'shm');
    const isPendulum = (isSHM && window.shmType === 'pendulum');

    canvas.classList.toggle('canvas-pendulum-mode', isPendulum);

    window.cxZero = padLeft;
    window.cyZero = padBottom;
    window.scaleX = window.scaleX || 350;
    window.scaleY = window.scaleY || 90;
    window.pxPerUnitX = (canvas.width - 100) / window.scaleX;
    window.pxPerUnitY = (canvas.height - 100) / window.scaleY;

    if (!isSHM) {
        if (typeof drawGridSystem === 'function') drawGridSystem();
        if (typeof drawProjectileTrack === 'function') drawProjectileTrack();
        
        if (window.active) {
            renderBallObject(window.mx, window.my);
        } else {
            const startHeight = (typeof elHeight !== 'undefined' && elHeight) ? Number(elHeight.value) : 0;
            if (window.simHistory && window.simHistory.length > 0) {
                const lastIndex = window.simHistory.length - 1;
                renderBallObject(window.simHistory[lastIndex][0], window.simHistory[lastIndex][1]);
            } else {
                renderBallObject(0, startHeight);
            }
        }
    } else {
        if (typeof window.drawSHMCanvasFrame === 'function') {
            window.drawSHMCanvasFrame();
        }
    }
} 

// --- Input Readout Event Listeners ---
if (elDrag && valDrag) {
    elDrag.addEventListener('input', function() {
        valDrag.textContent = parseFloat(this.value).toFixed(1);
    });
}
if (elWind && valWind) {
    elWind.addEventListener('input', function() { 
        valWind.textContent = this.value; 
    });
}

if (selGravity) {
    selGravity.addEventListener('change', function() {
        if (!window.active) {
            if (selExperiment && selExperiment.value === 'shm') {
                if (typeof adjustSHMScale === 'function') adjustSHMScale();
            } else {
                if (typeof adjustViewportScale === 'function') adjustViewportScale();
            }
            refreshDisplay();
        }
    });
}

if (selTheme) {
    selTheme.addEventListener('change', function() {
        document.body.className = this.value; 
        activeTheme = themePalettes[this.value] || themePalettes.space;
        refreshDisplay();
    });
}

function syncSliderDisplay(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(valueId);
    if (slider && display) {
        display.textContent = slider.value;
    }
}

function bindSliderValue(sliderId, valueId, formatter) {
    const slider = document.getElementById(sliderId);
    const target = document.getElementById(valueId);

    if (!slider || !target) return;

    slider.addEventListener('input', function() {
        const value = typeof formatter === 'function' ? formatter(this.value) : this.value;
        target.textContent = value;
        if (!window.active) {
            if (typeof refreshDisplay === 'function') {
                refreshDisplay();
            }
        }
    });
}

// --- Page Router ---
function setExperimentView(experimentValue) {
    const isSHM = experimentValue === 'shm';
    const projPage = document.getElementById('projectilePage');
    const shmPage = document.getElementById('shmPage');
    const projRes = document.getElementById('projectileResults');
    const shmRes = document.getElementById('shmResults');
    const subTitle = document.getElementById('dynamicSubtitle');

    if (typeof abortSimulation === 'function') {
        try { abortSimulation(); } catch (error) {}
    }
    if (typeof abortSHMSimulation === 'function') {
        try { abortSHMSimulation(); } catch (error) {}
    }

    if (projPage) projPage.classList.toggle('hidden-page', isSHM);
    if (shmPage) shmPage.classList.toggle('hidden-page', !isSHM);
    if (projRes) projRes.classList.toggle('hidden-panel', isSHM);
    if (shmRes) shmRes.classList.toggle('hidden-panel', !isSHM);
    if (subTitle) {
        subTitle.textContent = isSHM ? 'Simple Harmonic Motion Simulator' : 'Projectile Motion Simulator';
    }

    if (isSHM) {
        // Show picker, hide both sub-panels
        hideAllSHMContent();
        const picker = document.getElementById('shmPicker');
        if (picker) picker.classList.remove('hidden-page');
        if (typeof adjustSHMScale === 'function') adjustSHMScale();
    } else {
        if (typeof adjustViewportScale === 'function') adjustViewportScale();
    }

    if (typeof refreshDisplay === 'function') {
        refreshDisplay();
    }
}

function hideAllSHMContent() {
    const picker = document.getElementById('shmPicker');
    const linear = document.getElementById('linearSHMContent');
    const pendulum = document.getElementById('pendulumSHMContent');
    if (picker) picker.classList.add('hidden-page');
    if (linear) linear.classList.add('hidden-page');
    if (pendulum) pendulum.classList.add('hidden-page');
}

function selectSHMType(type) {
    window.shmType = type;
    hideAllSHMContent();
    const content = document.getElementById(type === 'linear' ? 'linearSHMContent' : 'pendulumSHMContent');
    if (content) content.classList.remove('hidden-page');

    if (typeof abortSHMSimulation === 'function') {
        try { abortSHMSimulation(); } catch (error) {}
    }

    if (typeof adjustSHMScale === 'function') adjustSHMScale();
    if (typeof refreshDisplay === 'function') refreshDisplay();
}

function handleFBDToggle() {
    if (typeof refreshDisplay === 'function') {
        refreshDisplay();
    }
}

// --- Unified Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Projectile slider readouts ---
    const bindProjSlider = (sliderEl, valEl) => {
        if (sliderEl && valEl) {
            sliderEl.addEventListener('input', function() {
                valEl.textContent = this.value;
                if (!window.active) {
                    if (typeof adjustViewportScale === 'function') adjustViewportScale();
                    if (typeof refreshDisplay === 'function') refreshDisplay();
                }
            });
        }
    };
    bindProjSlider(elVelocity, valVelocity);
    bindProjSlider(elAngle, valAngle);
    bindProjSlider(elHeight, valHeight);

    // --- SHM spring slider readouts ---
    const bindSpringSlider = (id, valId) => {
        const input = document.getElementById(id);
        const display = document.getElementById(valId);
        if (input && display) {
            input.addEventListener('input', function() {
                display.textContent = this.value;
                if (!window.active) {
                    if (typeof adjustSHMScale === 'function') adjustSHMScale();
                    if (typeof refreshDisplay === 'function') refreshDisplay();
                }
            });
        }
    };
    bindSpringSlider('springK', 'springKValue');
    bindSpringSlider('mass', 'massValue');
    bindSpringSlider('amplitude', 'amplitudeValue');

    // --- Pendulum slider readouts ---
    bindSliderValue('pendulumLength', 'lengthValue', value => parseFloat(value).toFixed(1));
    bindSliderValue('pendulumMass', 'bobMassValue', value => parseFloat(value).toFixed(1));
    bindSliderValue('pendulumTheta', 'thetaValue', value => parseInt(value, 10));

    // --- FBD checkbox ---
    const showFBD = document.getElementById('showFBD');
    if (showFBD) {
        showFBD.addEventListener('change', handleFBDToggle);
    }

    // --- Experiment selector: unified listener ---
    if (selExperiment) {
        selExperiment.addEventListener('change', function() {
            setExperimentView(this.value);
        });
    }

    // --- SHM Picker Buttons ---
    const pickLinear = document.getElementById('pickLinearSHM');
    const pickPendulum = document.getElementById('pickPendulumSHM');
    if (pickLinear) pickLinear.addEventListener('click', () => selectSHMType('linear'));
    if (pickPendulum) pickPendulum.addEventListener('click', () => selectSHMType('pendulum'));

    // --- SHM Start Buttons ---
    const bindSHMBtn = (btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => {
            if (typeof triggerSHMSimulation === 'function') triggerSHMSimulation();
        });
    };
    bindSHMBtn('startSHMBtn');
    bindSHMBtn('startPendulumBtn');

    // --- Initialize Display ---
    setExperimentView(selExperiment ? selExperiment.value : 'projectile');

    // Ensure initial readout values match sliders
    syncSliderDisplay('velocity', 'velocityValue');
    syncSliderDisplay('angle', 'angleValue');
    syncSliderDisplay('height', 'heightValue');

    if (typeof adjustViewportScale === 'function') {
        adjustViewportScale();
    }
    if (typeof refreshDisplay === 'function') {
        refreshDisplay();
    }
    console.log('Initialization Complete.');
});
