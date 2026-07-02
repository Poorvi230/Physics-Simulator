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
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const button = document.getElementById('launchBtn');
const themeSelector =
document.getElementById("themeSelect");

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

function launchProjectile() {
    let x= 50;
    let initialHeight = Number(heightSlider.value);
    let y= 350 - initialHeight *2;
    let trail = [];
    let velocity = Number(velocitySlider.value);  //horizontal speed
    let angle = Number(angleSlider.value); // initial angle

    let angleRad = angle * (Math.PI / 180); 

    let dx = velocity * Math.cos(angleRad) * 0.2; 
    let dy = -velocity * Math.sin(angleRad) * 0.2;

    let gravity= 0.3;
    let animation = setInterval(() => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draw X axis
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(500, 250);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    //Draw Y axis
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(50, 30);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // X-axis tick marks

for(let i = 0; i <= 14; i++){

    let xTick = 50 + i * 50;

    ctx.beginPath();

    ctx.moveTo(xTick, 345);
    ctx.lineTo(xTick, 355);

    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "12px Arial";

    ctx.fillText(i * 10, xTick - 8, 370);
}


// Y-axis tick marks

for(let i = 0; i <= 6; i++){

    let yTick = 350 - i * 50;

    ctx.beginPath();

    ctx.moveTo(45, yTick);
    ctx.lineTo(55, yTick);

    ctx.stroke();

    ctx.fillText(i * 10, 15, yTick + 5);
}

    //Axis labels
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText("Distance (m)", 220, 290);
    ctx.save();
    ctx.translate(20, 150);
    ctx.rotate(-Math.PI / 2);

    ctx.fillText("Height (h)", 0, 0);
ctx.restore();

dy += gravity;

x += dx;
y += dy;
trail.push ({
    x: x,
    y: y
});

ctx.beginPath();
ctx.arc(x, y, 10, 0, Math.PI * 2);
let gradient = ctx.createRadialGradient(x-3, y-3, 2, x, y, 12);
gradient.addColorStop(0, "#ffffff");
gradient.addColorStop(0.3, "#60a5fa");
gradient.addColorStop(1, "#1e3a8a");
ctx.fillStyle = gradient;
ctx.fill();

if (y > 350) {
    clearInterval(animation);
       }
    }, 20);
}
