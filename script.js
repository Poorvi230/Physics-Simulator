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

const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext('2d');

const button = document.getElementById('launchBtn');
button.addEventListener("click", launchProjectile);

function launchProjectile() {
    let x= 50;
    let y= 350;
    let velocity = Number(velocitySlider.value);  //horizontal speed
    let angle = Number(angleSlider.value); // initial angle

    let angleRad = angle * (Math.PI / 180); 

    let dx = velocity * Math.cos(angleRad) * 0.2; 
    let dy = -velocity * Math.sin(angleRad) * 0.2;
    
    let gravity= 0.3;
    let animation = setInterval(() => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
