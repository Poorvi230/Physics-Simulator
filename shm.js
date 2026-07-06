let shmLoopId = null;

function getSHMType() {
    const selector = document.getElementById('shmTypeSelect');
    return selector ? selector.value : 'spring';
}

function adjustSHMScale() {
    const selectExp = document.getElementById('experimentSelect');
    if (selectExp && selectExp.value === 'shm') {
        window.scaleX = 10; 
        if (getSHMType() === 'spring') {
            const elAmplitude = document.getElementById('amplitude');
            window.scaleY = elAmplitude ? Number(elAmplitude.value) * 1.5 : 10; 
        } else {
            window.scaleY = 50;
        }
    }
}

function triggerSHMSimulation() {
    if (window.active) return;
    window.active = true;
    window.simHistory = [];
    window.simTime = 0;
    adjustSHMScale();

    const shmType = getSHMType();
    let omega = 0;
    let maxTime = 10;

    if (shmType === 'spring') {
        const k = Number(document.getElementById('springK')?.value || 50);
        const m = Number(document.getElementById('mass')?.value || 2);
        omega = Math.sqrt(k / m);
    } else {
        const L = Number(document.getElementById('pendulumLength')?.value || 2.5);
        const g = 9.81;
        omega = Math.sqrt(g / L);
    }

    const period = (2 * Math.PI) / omega;
    const frequency = 1 / period;
    
    if (document.getElementById('resOmega')) document.getElementById('resOmega').textContent = omega.toFixed(2);
    if (document.getElementById('resPeriod')) document.getElementById('resPeriod').textContent = period.toFixed(2);
    if (document.getElementById('resFrequency')) document.getElementById('resFrequency').textContent = frequency.toFixed(2);

    shmLoopId = setInterval(() => {
        const dt = window.TIMESTEP || 0.02;
        window.simTime += dt;

        if (shmType === 'spring') {
            const A = Number(document.getElementById('amplitude')?.value || 4);
            window.my = A * Math.cos(omega * window.simTime);
            window.mx = window.simTime; 
        } else {
            const theta0 = Number(document.getElementById('pendulumTheta')?.value || 15) * (Math.PI / 180);
            window.my = theta0 * Math.cos(omega * window.simTime) * (180 / Math.PI);
            window.mx = window.simTime;
        }

        if (window.simTime >= maxTime) {
            window.active = false;
            clearInterval(shmLoopId);
        }
        
        window.simHistory.push([window.mx, window.my]);
        
        if (typeof refreshDisplay === 'function') {
            refreshDisplay();
        } else {
            drawSHMCanvasFrame();
        }
    }, 20);
}

function drawSHMCanvasFrame() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (getSHMType() === 'pendulum') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pivotX = canvas.width / 2;
        const pivotY = 30;
        const L = Number(document.getElementById('pendulumLength')?.value || 2.5) * 35;
        const theta0 = Number(document.getElementById('pendulumTheta')?.value || 15) * (Math.PI / 180);
        const m = Number(document.getElementById('pendulumMass')?.value || 2);
        
        let currentAngle = 0;
        if (window.active) {
            const k = 9.81 / (L / 35);
            currentAngle = theta0 * Math.cos(Math.sqrt(k) * window.simTime);
        } else {
            currentAngle = theta0;
        }

        const ballX = pivotX + L * Math.sin(currentAngle);
        const ballY = pivotY + L * Math.cos(currentAngle);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(ballX, ballY);
        ctx.stroke();

        const radius = 12 + (m * 2);
        const grad = ctx.createRadialGradient(ballX - radius/3, ballY - radius/3, 1, ballX, ballY, radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#a3a8b0');
        grad.addColorStop(1, '#3a3d42');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
        ctx.fill();

        const fbdCheck = document.getElementById('showFBD');
        if (fbdCheck && fbdCheck.checked) {
            ctx.save();
            ctx.font = "11px sans-serif";
            
            ctx.strokeStyle = '#ff007f';
            ctx.fillStyle = '#ff007f';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(ballX, ballY); ctx.lineTo(ballX, ballY + 50); ctx.stroke();
            ctx.fillText("mg", ballX + 5, ballY + 45);

            ctx.strokeStyle = '#00f2fe';
            ctx.fillStyle = '#00f2fe';
            ctx.beginPath(); ctx.moveTo(ballX, ballY); ctx.lineTo(ballX - 45 * Math.sin(currentAngle), ballY - 45 * Math.cos(currentAngle)); ctx.stroke();
            ctx.fillText("T", ballX - 35 * Math.sin(currentAngle) - 10, ballY - 35 * Math.cos(currentAngle));
            
            ctx.restore();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const setupInputSync = (id, valId) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                const valSpan = document.getElementById(valId);
                if (valSpan) valSpan.textContent = this.value;
                if (!window.active) { adjustSHMScale(); if(typeof refreshDisplay === 'function') refreshDisplay(); else drawSHMCanvasFrame(); }
            });
        }
    };

    setupInputSync('springK', 'springKValue');
    setupInputSync('mass', 'massValue');
    setupInputSync('amplitude', 'amplitudeValue');

    const bindBtn = (btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', triggerSHMSimulation);
    };
    bindBtn('startSHMBtn');
    bindBtn('startSpringBtn');
    bindBtn('startPendulumBtn');
});

function abortSHMSimulation() {
    window.active = false;
    clearInterval(shmLoopId);
    window.simHistory = [];
    window.simTime = 0;
    window.mx = 0;
    
    const ampEl = document.getElementById('amplitude');
    window.my = ampEl ? Number(ampEl.value) : 4;
    
    adjustSHMScale();
    if (typeof refreshDisplay === 'function') refreshDisplay();
    else drawSHMCanvasFrame();
}

if (typeof btnReset !== 'undefined' && btnReset) {
    btnReset.addEventListener('click', () => {
        const selectExp = document.getElementById('experimentSelect');
        if (selectExp && selectExp.value === 'shm') {
            abortSHMSimulation();
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const selExperiment = document.getElementById('experimentSelect');
    if (selExperiment) {
        selExperiment.dispatchEvent(new Event('change'));
    }
});