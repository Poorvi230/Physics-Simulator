// --- DOM Elements ---
const elVelocity = document.getElementById('velocity');
const elAngle = document.getElementById('angle');
const elHeight = document.getElementById('height');

const valVelocity = document.getElementById('velocityValue');
const valAngle = document.getElementById('angleValue');
const valHeight = document.getElementById('heightValue');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const btnLaunch = document.getElementById('launchBtn');
const btnReset = document.getElementById('resetBtn');
const selTheme = document.getElementById('themeSelect');
const selExperiment = document.getElementById('experimentSelect');

// New Environmental Controls
const selGravity = document.getElementById('gravitySelect');
const elDrag = document.getElementById('drag');
const elWind = document.getElementById('wind');
const valDrag = document.getElementById('dragValue');
const valWind = document.getElementById('windValue');

// --- Simulation State & Settings ---
let loopId = null;
let active = false;
let history = []; 
let simTime = 0;

let mx = 0;
let my = 0;
let vx = 0;
let vy = 0;

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

// --- Scale Computations ---
function adjustViewportScale() {
    const v0 = Number(elVelocity.value);
    const rad = (Number(elAngle.value) * Math.PI) / 180;
    const h0 = Number(elHeight.value);
    const currentGravity = Number(selGravity.value);

    const initVx = v0 * Math.cos(rad);
    const initVy = v0 * Math.sin(rad);

    const gValue = currentGravity > 0 ? currentGravity : 9.81;
    const peak = h0 + (initVy > 0 ? (initVy * initVy) / (2 * gValue) : 0);

    const root = (initVy * initVy) + (2 * gValue * h0);
    let airtime = 0;
    if (root >= 0) {
        airtime = (initVy + Math.sqrt(root)) / gValue;
    }
    const distance = initVx * airtime;

    scaleX = Math.max(distance, 10) * 1.25;
    scaleY = Math.max(peak, 10) * 1.25;
}

function getXPixel(metersX) {
    return padLeft + (metersX / scaleX) * viewW;
}

function getYPixel(metersY) {
    return padBottom - (metersY / scaleY) * viewH;
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
    if (history.length === 0) return;
    ctx.beginPath();
    ctx.strokeStyle = activeTheme.trace;
    ctx.lineWidth = 3;
    
    ctx.moveTo(getXPixel(history[0][0]), getYPixel(history[0][1]));
    for (let i = 1; i < history.length; i++) {
        ctx.lineTo(getXPixel(history[i][0]), getYPixel(history[i][1]));
    }
    ctx.stroke();
}

function renderBallObject(metersX, metersY) {
    let px = getXPixel(metersX);
    let py = getYPixel(metersY);

    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);

    let grad = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, activeTheme.primary);
    
    ctx.fillStyle = grad;
    ctx.fill();
}

function refreshDisplay() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(selTheme) {
        activeTheme = themePalettes[selTheme.value] || themePalettes.space; 
    }
    drawGridSystem();
    drawProjectileTrack();
    
    if (active) {
        renderBallObject(mx, my);
    } else {
        renderBallObject(0, Number(elHeight.value));
    }
}

// --- Mechanics Action Loop ---
function triggerSimulation() {
    if (active) return; 

    const initialVelocity = Number(elVelocity.value);
    const rad = (Number(elAngle.value) * Math.PI) / 180;
    
    simTime = 0;
    mx = 0;
    my = Number(elHeight.value);
    vx = initialVelocity * Math.cos(rad);
    vy = initialVelocity * Math.sin(rad);

    history = [[mx, my]];
    active = true;
    adjustViewportScale();

    loopId = setInterval(() => {
        simTime += TIMESTEP;

        const currentGravity = Number(selGravity.value);
        const dragCoeff = parseFloat(elDrag.value) * 0.005; 
        const windSpeed = Number(elWind.value);

        const relativeVx = vx - windSpeed;
        const dragForceX = dragCoeff * relativeVx * Math.abs(relativeVx);
        const dragForceY = dragCoeff * vy * Math.abs(vy);

        vx -= dragForceX * TIMESTEP;
        vy -= (currentGravity + dragForceY) * TIMESTEP;

        mx += vx * TIMESTEP;
        my += vy * TIMESTEP;

        if (my <= 0) {
            my = 0;
            active = false;
            clearInterval(loopId);
        }

        history.push([mx, my]);
        refreshDisplay();
    }, 20);
}

function abortSimulation() {
    active = false;
    clearInterval(loopId);
    history = [];
    simTime = 0;
    mx = 0;
    vy = 0;
    my = Number(elHeight.value);
    adjustViewportScale();
    refreshDisplay();
}

// --- Wire Handlers ---
elVelocity.oninput = function() {
    valVelocity.textContent = this.value;
    if (!active) { adjustViewportScale(); refreshDisplay(); }
};

elAngle.oninput = function() {
    valAngle.textContent = this.value;
    if (!active) { adjustViewportScale(); refreshDisplay(); }
};

elHeight.oninput = function() {
    valHeight.textContent = this.value; 
    if (!active) { adjustViewportScale(); refreshDisplay(); }
};

elDrag.oninput = function() {
    valDrag.textContent = this.value;
};

elWind.oninput = function() {
    valWind.textContent = this.value;
};

selGravity.addEventListener('change', function() {
    if (!active) { adjustViewportScale(); refreshDisplay(); }
});

selTheme.addEventListener('change', function() {
    document.body.className = this.value; 
    activeTheme = themePalettes[this.value] || themePalettes.space;
    refreshDisplay();
});

selExperiment.addEventListener('change', function() {
    abortSimulation();
});

btnLaunch.addEventListener('click', triggerSimulation);
btnReset.addEventListener('click', abortSimulation);

// Bootstrap setup initialization properties
adjustViewportScale();
refreshDisplay();

console.log("Velocity Element:", elVelocity, "Canvas Element:", canvas);