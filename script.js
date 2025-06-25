const maxRPM = 12000;
const idleRPM = 1000;
const ratios = {
  1: 0.005833,
  2: 0.009167,
  3: 0.013333,
  4: 0.0175,
  5: 0.021667,
  6: 0.025
};
const accelFactor = 0.5;
const drag = 0.02;

let gear = 1;
let speed = 0; // km/h
let rpm = idleRPM;
let throttle = document.getElementById('throttle');

const rpmSpan = document.getElementById('rpm');
const speedSpan = document.getElementById('speed');
const gearSpan = document.getElementById('gear');

document.getElementById('gear-up').addEventListener('click', () => {
  if (gear < 6) gear++;
  gearSpan.textContent = gear;
});

document.getElementById('gear-down').addEventListener('click', () => {
  if (gear > 1) gear--;
  gearSpan.textContent = gear;
});

// Setup Web Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioCtx.createOscillator();
oscillator.type = 'sawtooth';
const gainNode = audioCtx.createGain();
oscillator.connect(gainNode).connect(audioCtx.destination);
oscillator.start();

audioCtx.resume(); // required for some browsers

function updateAudio() {
  const freq = 50 + rpm * 0.05; // rough mapping
  oscillator.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
  gainNode.gain.setTargetAtTime(throttle.value / 100, audioCtx.currentTime, 0.05);
}

function update() {
  // acceleration
  const acceleration = (throttle.value / 100) * accelFactor;
  speed += acceleration;
  speed -= speed * drag;
  if (speed < 0) speed = 0;

  rpm = speed / ratios[gear];
  if (rpm < idleRPM && speed === 0 && throttle.value == 0) rpm = idleRPM;
  if (rpm > maxRPM) {
    rpm = maxRPM;
    speed = rpm * ratios[gear]; // hold at rev limiter
  }

  rpmSpan.textContent = Math.round(rpm);
  speedSpan.textContent = Math.round(speed);
  updateAudio();
}

setInterval(update, 50);
