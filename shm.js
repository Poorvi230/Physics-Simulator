// --- SHM DOM Hooks (Safe from Const Errors) ---
// We don't re-assign shared variables like selExperiment here anymore.
// We only map the sliders unique to the SHM panel:

var elSpringK = document.getElementById('springK');
var elMass = document.getElementById('mass');
var elAmplitude = document.getElementById('amplitude');

var valSpringK = document.getElementById('springKValue');
var valMass = document.getElementById('massValue');
var valAmplitude = document.getElementById('amplitudeValue');

var btnStartSHM = document.getElementById('startSHMBtn');

// --- SHM Variables & Loops ---
let shmLoopId = null;

function adjustSHMScale() {
    if (typeof selExperiment !== 'undefined' && selExperiment && selExperiment.value === 'shm') {
        window.scaleX = 10; 
        window.scaleY = Number(document.getElementById('amplitude').value) * 1.5; 
    }
}

function triggerSHMSimulation() {
    if (window.active) return;
    window.active = true;
    window.simHistory = [];
    simTime = 0;
    adjustSHMScale();

    const k = Number(elSpringK.value);
    const m = Number(elMass.value);
    const A = Number(elAmplitude.value);
    const omega = Math.sqrt(k / m);

    shmLoopId = setInterval(() => {
        simTime += window.TIMESTEP;

        my = A * Math.cos(omega * simTime);
        mx = simTime; 

        if(simTime >= 10) {
            window.active = false;
            clearInterval(shmLoopId);
        }
        window.simHistory.push([mx, my]);
        refreshDisplay();
    }, 20);
}

if(btnStartSHM) btnStartSHM.addEventListener('click', triggerSHMSimulation);

if (elSpringK) {
    elSpringK.onionput = function() {
    if (valSpringK) valSpringK.textContent = this.value;
    if (!window.active) { adjustSHMScale(); refreshDisplay(); }
};
}

if (elMass) {
elMass.onionput = function() {
    if (valMass) valMass.textContent = this.value;
    if (!window.active) { adjustSHMScale(); refreshDisplay(); }
};
}

if (elAmplitude) {
elAmplitude.oninput = function() {
   if (valAmplitude) valAmplitude.textContent = this.value;
    if (!window.active) { adjustSHMScale(); refreshDisplay(); }
};
}

// -- SHM Reset ---
function abortSHMSimulation() {
    window.active = false;
    clearInterval(shmLoopId);
    window.simHistory = [];
    simTime = 0;
    mx = 0;
    my = Number(elAmplitude.value);
    adjustSHMScale();
    refereshDisplay();
}

if (btnReset) {
    btnReset.addEventListener('click', () => {
        if (selExperiment && selExperiment.value === 'shm') {
            abortSHMSimulation();
        }
    });
}