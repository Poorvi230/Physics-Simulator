// --- Projectile DOM Hooks ---
var elVelocity = document.getElementById('velocity');
var elAngle = document.getElementById('angle');
var elHeight = document.getElementById('height');
var selGravity = document.getElementById('gravitySelect');
var elDrag = document.getElementById('drag');
var elWind = document.getElementById('wind');

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

// --- Mechanics Action Loop ---
function triggerSimulation() {
    if (window.active) return; 
    window.active = true;

    const initVelocity = Number(document.getElementById('velocity').value);
    const initAngle = Number(document.getElementById('angle').value);
    const initHeight = Number(document.getElementById('height').value);
    const selGravity = document.getElementById('gravitySelect');
    const elDrag = document.getElementById('drag');
    const elWind = document.getElementById('wind');
    
    const angleRad = (initAngle * Math.PI) / 180;
    let vx = initVelocity * Math.cos(angleRad);
    let vy = initVelocity * Math.sin(angleRad);

    window.simTime = 0;
    window.mx = 0;
    window.my = initHeight;
    window.simHistory = [[window.mx, window.my]];

    adjustViewportScale();
    
    window.loopId = setInterval(() => {
        const dt = window.TIMESTEP || 0.02;
        window.simTime += dt;

        const currentGravity = Number(selGravity ? selGravity.value : 9.8);
        const dragCoeff = parseFloat(elDrag ? elDrag.value : 0) * 0.005; 
        const windSpeed = Number(elWind ? elWind.value : 0);

        const relativeVx = vx - windSpeed;
        const dragForceX = dragCoeff * relativeVx * Math.abs(relativeVx);
        const dragForceY = dragCoeff * vy * Math.abs(vy);

        vx -= dragForceX * dt;
        vy -= (currentGravity + dragForceY) * dt;

        window.mx += vx * dt;
        window.my += vy * dt;

        const elDistance = document.getElementById('distanceDisplay');
        if (elDistance) {
            elDistance.textContent = window.mx.toFixed(2);
        }
// Ground check
        if (window.my <= 0) {
            window.my = 0;
            window.active = false;
            clearInterval(window.loopId);

            const resMaxHeight = document.getElementById('resMaxHeight');
            const resFlightTime = document.getElementById('resFlightTime');
            const resRange = document.getElementById('resRange');

            if (resMaxHeight && resFlightTime && resRange) {
                let maxH = 0;
                for (let i = 0; i < window.simHistory.length; i++) {
                    if (window.simHistory[i][1] > maxH) {
                        maxH = window.simHistory[i][1];
                    }
                }
                resMaxHeight.textContent = maxH.toFixed(2);
                resFlightTime.textContent = window.simTime.toFixed(2);
                resRange.textContent = window.mx.toFixed(2);
            }
        } 
        window.simHistory.push([window.mx, window.my]);
        
       refreshDisplay(); 
    }, 20); 
}

function abortSimulation() {
    window.active = false;
    clearInterval(window.loopId); 
    window.simHistory = [];
    window.simTime = 0;           
    window.mx = 0;               
    window.my = elHeight ? Number(elHeight.value) : 0;
    adjustViewportScale();
    refreshDisplay();
}

// --- Projectile Button Event Listeners ---
const rocketBtn = document.getElementById('launchBtn');
if (rocketBtn) {
    rocketBtn.addEventListener('click', function() {
        const currentMode = document.getElementById('experimentSelect');
        if (!currentMode || currentMode.value === 'projectile' || currentMode.value === '') {
            triggerSimulation();
        }
    });
}

const clearBtn = document.getElementById('resetBtn');
if (clearBtn) {
    clearBtn.addEventListener('click', function() {
        const currentMode = document.getElementById('experimentSelect');
        if (!currentMode || currentMode.value === 'projectile' || currentMode.value === '') {
            abortSimulation();
        }
    });
}
