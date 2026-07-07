let shmLoopId = null;

function getSHMType() {
    return window.shmType === 'pendulum' ? 'pendulum' : 'spring';
}

function adjustSHMScale() {
    const selectExp = document.getElementById('experimentSelect');
    if (selectExp && selectExp.value === 'shm') {
        window.scaleX = 350;

        if (getSHMType() === 'spring') {
            const elAmplitude = document.getElementById('amplitude');
            const amp = elAmplitude ? Number(elAmplitude.value) : 4;
            window.scaleY = (40 + amp) * 1.2;
        } else {
            window.scaleY = 90;
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
            window.my = 40 + (A * Math.cos(omega * window.simTime));
            window.mx = window.simTime * 30;
        } else {
            const theta0 = Number(document.getElementById('pendulumTheta')?.value || 15) * (Math.PI / 180);
            window.my = 40 + (theta0 * Math.cos(omega * window.simTime) * (180 / Math.PI));
            window.mx = window.simTime * 30;
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

// --- SHM Canvas Drawing ---
function drawSHMCanvasFrame() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const shmType = getSHMType();

    // ─── Linear SHM: Sine Wave Plot ───
    if (shmType === 'spring') {
        const A = Number(document.getElementById('amplitude')?.value || 4);

        // Axis mapping
        const axLeft = 70, axRight = canvas.width - 90;
        const axTop = 40, axBottom = canvas.height - 60;
        const plotW = axRight - axLeft;
        const plotH = axBottom - axTop;
        const maxTime = 10;

        // Y-axis scale: -A to +A
        // X-axis scale: 0 to maxTime seconds

        ctx.strokeStyle = activeTheme.line;
        ctx.fillStyle = activeTheme.txt;
        ctx.lineWidth = 2;

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(axLeft, axTop);
        ctx.lineTo(axLeft, axBottom);
        ctx.stroke();

        // X-axis
        ctx.beginPath();
        ctx.moveTo(axLeft, axBottom);
        ctx.lineTo(axRight, axBottom);
        ctx.stroke();

        // Y-axis tick marks
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = -2; i <= 2; i++) {
            const ratio = (i + 2) / 4;
            const py = axBottom - ratio * plotH;
            ctx.beginPath();
            ctx.moveTo(axLeft - 5, py);
            ctx.lineTo(axLeft + 2, py);
            ctx.stroke();
            const val = i * A;
            ctx.fillText(val.toFixed(1), axLeft - 12, py);
        }

        // X-axis tick marks
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= 5; i++) {
            const ratio = i / 5;
            const px = axLeft + ratio * plotW;
            ctx.beginPath();
            ctx.moveTo(px, axBottom - 2);
            ctx.lineTo(px, axBottom + 5);
            ctx.stroke();
            ctx.fillText((i * 2).toFixed(0), px, axBottom + 8);
        }

        // Axis labels
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', axLeft + plotW / 2, axBottom + 28);
        ctx.save();
        ctx.translate(18, axTop + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Displacement (m)', 0, 0);
        ctx.restore();

        // Equilibrium dashed line
        const eqRatio = (0 + 2) / 4;
        const eqY = axBottom - eqRatio * plotH;
        ctx.strokeStyle = activeTheme.line;
        ctx.globalAlpha = 0.4;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(axLeft, eqY);
        ctx.lineTo(axRight, eqY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Plot the sine wave from simHistory
        if (window.simHistory && window.simHistory.length > 1) {
            ctx.strokeStyle = activeTheme.primary || '#0ea5e9';
            ctx.lineWidth = 3;
            ctx.beginPath();
            let started = false;
            for (let i = 0; i < window.simHistory.length; i++) {
                const t = window.simHistory[i][0] / 30;
                const d = window.simHistory[i][1] - 40;
                const px = axLeft + (t / maxTime) * plotW;
                const py = axBottom - ((d / A) + 2) / 4 * plotH;
                if (!isFinite(px) || !isFinite(py)) continue;
                if (!started) { ctx.moveTo(px, py); started = true; }
                else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Moving dot at current position
            if (window.simHistory.length > 0) {
                const last = window.simHistory[window.simHistory.length - 1];
                const t = last[0] / 30;
                const d = last[1] - 40;
                const dx = axLeft + (t / maxTime) * plotW;
                const dy = axBottom - ((d / A) + 2) / 4 * plotH;
                if (isFinite(dx) && isFinite(dy)) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(dx, dy, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = activeTheme.primary || '#0ea5e9';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    }

    // ─── Pendulum SHM ───
    if (shmType === 'pendulum') {
        const pivotX = canvas.width / 2;
        const pivotY = 30; 
        
        const L = Number(document.getElementById('pendulumLength')?.value || 2.5) * 125;
        const theta0 = Number(document.getElementById('pendulumTheta')?.value || 15) * (Math.PI / 180);
        const m = Number(document.getElementById('pendulumMass')?.value || 2);
        
        let currentAngle = 0;
        if (window.active) {
            const realL = Number(document.getElementById('pendulumLength')?.value || 2.5);
            const omega = Math.sqrt(9.81 / realL);
            currentAngle = theta0 * Math.cos(omega * window.simTime);
        } else {
            currentAngle = theta0;
        }

        if (L > 10) {
            const ballX = pivotX + L * Math.sin(currentAngle);
            const ballY = pivotY + L * Math.cos(currentAngle);

            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.lineTo(ballX, ballY);
            ctx.stroke();

            const radius = 14 + (m * 2);
            ctx.fillStyle = '#63b3ed';
            ctx.beginPath();
            ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
            ctx.fill();

            const fbdCheck = document.getElementById('showFBD');
            const isSimulationStopped = !window.active && window.simTime > 0;

            if (fbdCheck && fbdCheck.checked && isSimulationStopped) {
                ctx.save();
                ctx.font = "bold 12px sans-serif";
                ctx.lineWidth = 2;

                const drawArrow = (x1, y1, x2, y2, color, text) => {
                    ctx.strokeStyle = color;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    
                    const angle = Math.atan2(y2 - y1, x2 - x1);
                    ctx.beginPath();
                    ctx.moveTo(x2, y2);
                    ctx.lineTo(x2 - 6 * Math.cos(angle - Math.PI/6), y2 - 6 * Math.sin(angle - Math.PI/6));
                    ctx.lineTo(x2 - 6 * Math.cos(angle + Math.PI/6), y2 - 6 * Math.sin(angle + Math.PI/6));
                    ctx.fill();
                    ctx.fillText(text, x2 + 8 * Math.cos(angle), y2 + 4);
                };

                drawArrow(ballX, ballY, ballX, ballY + 60, '#f56565', 'Fg = mg');

                const dx = (pivotX - ballX) / L;
                const dy = (pivotY - ballY) / L;
                drawArrow(ballX, ballY, ballX + dx * 60, ballY + dy * 60, '#00f2fe', 'Tension (T)');

                const rx = -dy * Math.sign(currentAngle);
                const ry = dx * Math.sign(currentAngle);
                drawArrow(ballX, ballY, ballX + rx * 45, ballY + ry * 45, '#ecc94b', 'mg sin(θ)');

                ctx.restore();
            }
        }
    }
}

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

window.drawSHMCanvasFrame = drawSHMCanvasFrame;

const resetSHMBtn = document.getElementById('resetBtn');
if (resetSHMBtn) {
    resetSHMBtn.addEventListener('click', () => {
        const selectExp = document.getElementById('experimentSelect');
        if (selectExp && selectExp.value === 'shm') {
            abortSHMSimulation();
        }
    });
}
