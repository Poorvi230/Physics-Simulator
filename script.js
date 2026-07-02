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
const themeSelector = document.getElementById("themeSelect");
themeSelector.addEventListener("change", () => {
    document.body.className = "space";
});
button.addEventListener("click", launchProjectile);

function launchProjectile() {
    let x= 50;
    let initialHeight = Number(heightSlider.value);
    let y= 350 - initialHeight *2;
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
    ctx.moveTo(50, 350);
    ctx.lineTo(750, 350);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    //Draw Y axis
    ctx.beginPath();
    ctx.moveTo(50, 350);
    ctx.lineTo(50, 50);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    //Axis labels
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('X', 760, 355);
    ctx.fillText('Y', 40, 40);

dy += gravity;

x += dx;
y += dy;

ctx.beginPath();
ctx.arc(x, y, 10, 0, Math.PI * 2);
ctx.fillStyle = 'red';
ctx.fill();

if (y > 350) {
    clearInterval(animation);
       }
    }, 20);
}
