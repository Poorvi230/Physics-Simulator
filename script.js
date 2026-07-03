const velocitySlider = document.getElementById('velocity');
const angleSlider = document.getElementById('angle');

const velocityValue = document.getElementById('velocityValue');
const angleValue = document.getElementById('angleValue');

velocitySlider.oninput = function() {
    velocityValue.textContent = this.value;
};

angleSlider.oninput = function() {
    angleValue.textContent = this.value;
};

const heightSlider = document.getElementById('height');
const heightValue = document.getElementById('heightValue');

heightSlider.oninput = function() {
    heightValue.textContent = this.value;
    drawInitialBall();
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let animation = null;
let maxRange = 100;
let maxHeight = 60;

const button = document.getElementById('launchBtn');
const resetBtn = document.getElementById('resetBtn');
const themeSelector = document.getElementById("themeSelect");
console.log(resetBtn);

themeSelector.addEventListener("change", function() {

    document.body.classList.remove(
        "space",
        "neon",
        "retro"
    );

    document.body.classList.add(
        themeSelector.value
    );

});
button.addEventListener("click", launchProjectile);
resetBtn.addEventListener("click", function() {

    ctx.clearRect(0, 0, canvas.width,canvas.height);
    drawInitialBall();
});

function drawInitialBall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxes();
    let y = 250 - Number(heightSlider.value) * 3;
    ctx.beginPath();
    ctx.arc(50, y, 10, 0, Math.PI * 2);
    let gradient = ctx.createRadialGradient(45, y - 5, 2, 50, y, 10);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#38bdf8");
    ctx.fillStyle = gradient;
    ctx.fill();
}

function drawAxes() {

    // X-axis
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(450, 200);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(50, 30);
    ctx.stroke();

    // X-axis tick marks
    const xDivisions = 10;
    for(let i = 0; i <= xDivisions; i++) {

        let xTick = 50 + i * 40;
        let label = Math.round((maxRange / xDivisions) * i);

        ctx.beginPath();
        ctx.moveTo(xTick, 195);
        ctx.lineTo(xTick, 205);
        ctx.stroke();
        ctx.font = "10px Arial";
        ctx.fillText(label, xTick - 8, 220);
    }

    // Y-axis tick marks
    const yDivisions= 6;
for(let i = 0; i <= yDivisions; i++) {

        let yTick = 200 - i * (170 / yDivisions);
        let label = Math.round((maxHeight / yDivisions) * i);

        ctx.beginPath();
        ctx.moveTo(45, yTick);
        ctx.lineTo(55, yTick);
        ctx.stroke();
        ctx.fillText(label, 10, yTick + 4);
    }

    // Axis labels
    ctx.font = "20px Arial";
    ctx.fillText("Distance (m)", 190, 240);
    ctx.save();
    ctx.translate(20, 170);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Height (m)", 0, 0);
    ctx.restore();
}

function launchProjectile() {

    clearInterval(animation);

    let x = 50;
    let initialHeight = Number(heightSlider.value);
    let y = 250 - initialHeight * 3;
    let velocity = Number(velocitySlider.value);
    let angle = Number(angleSlider.value);
    let angleRad = angle * Math.PI / 180;
    let dx = velocity * Math.cos(angleRad) * 0.20;
    let dy = -velocity * Math.sin(angleRad) * 0.20;
    let gravity = 0.30;

const g = 9.8;

const vx = velocity * Math.cos(angleRad);
const vy = velocity * Math.sin(angleRad);
maxHeight = initialHeight + (vy * vy) / (2 * g);
const flightTime = (vy + Math.sqrt(vy * vy + 2 * g * initialHeight)) / g;
maxRange = vx * flightTime;

// Leave a small margin
const xScale = 380 / (maxRange + 10);
const yScale = 150 / (maxHeight + 10);

const scale = Math.min(xScale, yScale);

    let trail = [];

    animation = setInterval(() => {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawAxes();

        // Physics
        dy += gravity;
        x += dx * scale;
        y += dy * scale;

        // Save trail
        trail.push({
            x: x,
            y: y
        });

        // Draw trail
        for (let point of trail) {

            let trailX = 50 + (point.x - 50) * scale;
            let trailY = 200 - ((250 - point.y) * scale);

            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(56,189,248,0.6)";
            ctx.fill();

        }

        // Draw ball
        let drawX = 50 + (x - 50) * scale;
        let drawY = 200 - ((250 - y) * scale);
        ctx.beginPath();
        ctx.arc(drawX, drawY, 10, 0, Math.PI * 2);

        let gradient = ctx.createRadialGradient(
            drawX - 3,
            drawY - 3,
            2,
            drawX,
            drawY,
            10
        );

        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.4, "#60a5fa");
        gradient.addColorStop(1, "#1e3a8a");

        ctx.fillStyle = gradient;
        ctx.fill();

        if (
            y > canvas.height ||
            x > canvas.width
        ) {

            clearInterval(animation);

        }

    }, 20);

}