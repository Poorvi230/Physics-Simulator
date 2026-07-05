// --- DOM Elements ---
var elVelocity = document.getElementById('velocity');
var elAngle = document.getElementById('angle');
var elHeight = document.getElementById('height');

var valVelocity = document.getElementById('velocityValue');
var valAngle = document.getElementById('angleValue');
var valHeight = document.getElementById('heightValue');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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

const padLeft = 60;
const padBottom = 210;
const viewW = 410; 
const viewH = 170;

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
    if (!window.simHistory || !Array.isArray(window.simHistory) || window.simHistory.length === 0) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selTheme) {
        activeTheme = themePalettes[selTheme.value] || themePalettes.space; 
    }

    // --- Compute Grid Metrics Globally Before Drawing ---
    window.cxZero = 60; // Left margin padding
    window.cyZero = canvas.height - 50; // Bottom margin padding
    
    window.pxPerUnitX = (canvas.width - 100) / window.scaleX;
    window.pxPerUnitY = (canvas.height - 100) / window.scaleY;

    drawGridSystem();
    drawProjectileTrack();
    
    if (window.active) {
        renderBallObject(window.mx, window.my);
    } else {
        // fallback in case elHeight isn't loaded yet
        const startHeight = (typeof elHeight !== 'undefined' && elHeight) ? Number(elHeight.value) : 0;
        if (window.simHistory && window.simHistory.length > 0) {
            const lastIndex = window.simHistory.length - 1;
            renderBallObject(window.simHistory[lastIndex][0], window.simHistory[lastIndex][1]);
        } else {
        renderBallObject(0, startHeight);
    }
  }
}

// --- Global Wire Handlers (Environment & Framework Switchers) ---

elDrag.oninput = function() {
    valDrag.textContent = this.value;
};

elWind.oninput = function() {
    valWind.textContent = this.value;
};

if (selGravity) {
    selGravity.addEventListener('change', function() {
        if (!active) {
            // Safely check which mode is active to scale the graph correctly
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

if (selExperiment) {
    selExperiment.addEventListener('change', function() {
        // Safely clear out any running simulation interval loops
        if (typeof abortSimulation === 'function') abortSimulation();
        if (typeof abortSHMSimulation === 'function') abortSHMSimulation();

        if (this.value === 'shm') {
            projControls.style.display = 'none';
            shmControls.style.display = 'block';
            if (typeof adjustSHMScale === 'function') adjustSHMScale();
        } else {
            projControls.style.display = 'block';
            shmControls.style.display = 'none';
            if (typeof adjustViewportScale === 'function') adjustViewportScale();
        }
        refreshDisplay();
    });
}

// --- Bootstrap Setup Initialization ---
// We give the browser a split second (50ms) to load projectile.js and shm.js 
// before running the first setup render!
setTimeout(() => {
    // Sync UI text displays with slider values on page boot
    if (document.getElementById('velocityValue') && document.getElementById('velocity')) {
        document.getElementById('velocityValue').textContent = document.getElementById('velocity').value;
    }
    if (document.getElementById('angleValue') && document.getElementById('angle')) {
        document.getElementById('angleValue').textContent = document.getElementById('angle').value;
    }
    if (document.getElementById('heightValue') && document.getElementById('height')) {
        document.getElementById('heightValue').textContent = document.getElementById('height').value;
    }

    if (typeof adjustViewportScale === 'function') {
        adjustViewportScale();
    }
    if (typeof refreshDisplay === 'function') {
        refreshDisplay();
    }
    console.log("Initialization Complete.")
}, 100);