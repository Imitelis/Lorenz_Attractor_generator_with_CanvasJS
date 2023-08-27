const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isRunning = false;

let path = [{ x: 1, y: 1, z: 1 }];
const dt = 0.01;

let sigma = 10;
let rho = 28;
let beta = 2.6;

let rotating = true;
let clockwise = true;

let xView = false;
let yView = true;
let zView = false;

const sliderSigma = document.getElementById("sigma");
const labelSigma = document.querySelector('[for="sigma"]');
const sliderRho = document.getElementById("rho");
const labelRho = document.querySelector('[for="rho"]');
const sliderBeta = document.getElementById("beta");
const labelBeta = document.querySelector('[for="beta"]');
const radioStatic = document.getElementById("static");
const radioRotating = document.getElementById("rotating");
const radioClockwise = document.getElementById("clockwise");
const radioAnticlockwise = document.getElementById("anticlockwise");
const radioXView = document.getElementById("x-view");
const radioYView = document.getElementById("y-view");
const radioZView = document.getElementById("z-view");
const resetButton = document.getElementById("reset-button");
const pauseButton = document.getElementById("pause-button");
const playButton = document.getElementById("play-button");

radioXView.checked = false;
radioYView.checked = true;
radioZView.checked = false;

function updateControls() {
  sliderSigma.value = sigma;
  labelSigma.innerText = Number(sigma);
  sliderRho.value = rho;
  labelRho.innerText = Number(rho);
  sliderBeta.value = beta;
  labelBeta.innerText = Number(beta).toFixed(2);
  radioStatic.checked = !rotating;
  radioRotating.checked = rotating;
  radioClockwise.checked = clockwise;
  radioAnticlockwise.checked = !clockwise;
  radioXView.checked = xView;
  radioYView.checked = yView;
  radioZView.checked = zView;
}

sliderSigma.addEventListener("change", async function (event) {
  sigma = event.target.value;
  updateControls();
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

sliderRho.addEventListener("change", async function (event) {
  rho = event.target.value;
  updateControls();
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

sliderBeta.addEventListener("change", async function (event) {
  beta = event.target.value;
  updateControls();
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

radioStatic.addEventListener("click", async function () {
  rotating = false;
  radioStatic.checked = !rotating;
  radioRotating.checked = rotating;
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

radioRotating.addEventListener("click", async function () {
  rotating = true;
  radioStatic.checked = !rotating;
  radioRotating.checked = rotating;
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

radioClockwise.addEventListener("click", async function () {
  clockwise = true;
  radioClockwise.checked = clockwise;
  radioAnticlockwise.checked = !clockwise;
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

radioAnticlockwise.addEventListener("click", async function () {
  clockwise = false;
  radioClockwise.checked = clockwise;
  radioAnticlockwise.checked = !clockwise;
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

radioXView.addEventListener("click", async function () {
  xView = true;
  yView = false;
  zView = false;
  radioXView.checked = xView;
  radioYView.checked = !xView;
  radioZView.checked = !xView;
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

radioYView.addEventListener("click", async function () {
  xView = false;
  yView = true;
  zView = false;
  radioXView.checked = !yView;
  radioYView.checked = yView;
  radioZView.checked = !yView;
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

radioZView.addEventListener("click", async function () {
  xView = false;
  yView = false;
  zView = true;
  radioXView.checked = !zView;
  radioYView.checked = !zView;
  radioZView.checked = zView;
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

resetButton.addEventListener("click", async function () {
  path = [{ x: 1, y: 1, z: 1 }];
  sigma = 10;
  rho = 28;
  beta = 2.6;
  rotating = true;
  clockwise = true;
  xView = false;
  yView = true;
  zView = false;
  radioStatic.checked = !rotating;
  radioRotating.checked = rotating;
  radioClockwise.checked = clockwise;
  radioAnticlockwise.checked = !clockwise;
  radioXView.checked = xView;
  radioYView.checked = yView;
  radioZView.checked = zView;
  updateControls();
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

playButton.addEventListener("click", async function () {
  if (!isRunning) {
    pauseSystem();
    await startSystem();
  }
});

pauseButton.addEventListener("click", async function () {
  pauseSystem();
});

updateControls();

function integrate({ x, y, z }) {
  x += sigma * (y - x) * dt;
  y += (x * (rho - z) - y) * dt;
  z += (x * y - beta * z) * dt;
  return { x, y, z };
}

function extendPath(path, steps) {
  [...Array(steps)].forEach(() => {
    const lastP = path[path.length - 1];
    const p = integrate(lastP);
    path.push(p);
  });
  return path;
}

function scale(points, size) {
  const mx = Math.min(...points.map(({ x, y, z }) => x));
  const Mx = Math.max(...points.map(({ x, y, z }) => x));
  const my = Math.min(...points.map(({ x, y, z }) => y));
  const My = Math.max(...points.map(({ x, y, z }) => y));
  const mz = Math.min(...points.map(({ x, y, z }) => z));
  const Mz = Math.max(...points.map(({ x, y, z }) => z));

  const s = (v, mv, Mv) => (size * (v - mv)) / (Mv - mv);
  return points.map(({ x, y, z }) => {
    x = s(x, mx, Mx);
    y = s(y, my, My);
    z = s(z, mz, Mz);
    return { x, y, z };
  });
}

var q = 0;
function drawPath(path) {
  q += 0.01;
  const largerWidth = canvas.height < canvas.width;
  const scaledSide =
    canvas.height < canvas.width ? canvas.width * 0.3 : canvas.height * 0.3;
  if (largerWidth) {
    if (xView && !rotating) {
      const map = ({ x, y, z }) => [y, z + 7.5];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0] + scaledSide, p[1]));
      ctx.stroke();
    } else if (yView && !rotating) {
      const map = ({ x, y, z }) => [x, z + 7.5];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0] + scaledSide, p[1]));
      ctx.stroke();
    } else if (zView && !rotating) {
      const map = ({ x, y, z }) => [x, y + 7.5];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0] + scaledSide, p[1]));
      ctx.stroke();
    } else if (
      (xView && rotating && clockwise) ||
      (yView && rotating && clockwise)
    ) {
      const map = ({ x, y, z }) => [
        (y - scaledSide) * Math.cos(q) -
          (x - scaledSide) * Math.sin(q) +
          scaledSide,
        z + 15,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0] + scaledSide, p[1]));
      ctx.stroke();
    } else if (
      (xView && rotating && !clockwise) ||
      (yView && rotating && !clockwise)
    ) {
      const map = ({ x, y, z }) => [
        (x - scaledSide) * Math.cos(q) -
          (y - scaledSide) * Math.sin(q) +
          scaledSide,
        z + 15,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0] + scaledSide, p[1]));
      ctx.stroke();
    } else if (zView && rotating && clockwise) {
      const map = ({ x, y, z }) => [
        x,
        (y - scaledSide) * Math.cos(q) -
          (z - scaledSide) * Math.sin(q) +
          scaledSide,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0] + scaledSide, p[1]));
      ctx.stroke();
    } else if (zView && rotating && !clockwise) {
      const map = ({ x, y, z }) => [
        x,
        (z - scaledSide) * Math.cos(q) -
          (y - scaledSide) * Math.sin(q) +
          scaledSide,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0] + scaledSide, p[1]));
      ctx.stroke();
    }
  } else if (!largerWidth) {
    if (xView && !rotating) {
      const map = ({ x, y, z }) => [y + 7.5, z];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0], p[1] + scaledSide / 2));
      ctx.stroke();
    } else if (yView && !rotating) {
      const map = ({ x, y, z }) => [x + 7.5, z];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0], p[1] + scaledSide / 2));
      ctx.stroke();
    } else if (zView && !rotating) {
      const map = ({ x, y, z }) => [x + 7.5, y];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0], p[1] + scaledSide / 2));
      ctx.stroke();
    } else if (
      (xView && rotating && clockwise) ||
      (yView && rotating && clockwise)
    ) {
      const map = ({ x, y, z }) => [
        (y - scaledSide) * Math.cos(q) -
          (x - scaledSide) * Math.sin(q) +
          scaledSide,
        z + 15,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0], p[1] + scaledSide / 2));
      ctx.stroke();
    } else if (
      (xView && rotating && !clockwise) ||
      (yView && rotating && !clockwise)
    ) {
      const map = ({ x, y, z }) => [
        (x - scaledSide) * Math.cos(q) -
          (y - scaledSide) * Math.sin(q) +
          scaledSide,
        z + 15,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0], p[1] + scaledSide / 2));
      ctx.stroke();
    } else if (zView && rotating && clockwise) {
      const map = ({ x, y, z }) => [
        x,
        (y - scaledSide) * Math.cos(q) -
          (z - scaledSide) * Math.sin(q) +
          scaledSide,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0], p[1] + scaledSide / 2));
      ctx.stroke();
    } else if (zView && rotating && !clockwise) {
      const map = ({ x, y, z }) => [
        x,
        (z - scaledSide) * Math.cos(q) -
          (y - scaledSide) * Math.sin(q) +
          scaledSide,
      ];
      ctx.beginPath();
      path.map(map).forEach((p) => ctx.lineTo(p[0], p[1] + scaledSide / 2));
      ctx.stroke();
    }
  }
}

function drawStep() {
  if (isRunning) {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "hsla(0, 100%, 45%, 0.9)";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "rgba(0, 0, 0, .05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    extendPath(path, 10);
    const smallerSide =
      canvas.height < canvas.width ? canvas.height : canvas.width;
    const scaled = scale(path, smallerSide - 20);
    drawPath(scaled);

    for (let i = 0; i < path.length && path.length > 3000; i++) {
      path.shift();
    }

    setTimeout(drawStep, 1000 / 60);
  }
}

function startSystem() {
  if (!isRunning) {
    isRunning = true;
    drawStep();
  }
}

function pauseSystem() {
  isRunning = false;
}

startSystem();

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  startSystem();
});
