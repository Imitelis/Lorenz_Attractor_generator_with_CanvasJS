const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let xView = false;
let yView = true;
let zView = false;

const dt = 0.01
const sigma = 10
const rho = 28
const beta = 2.6

const sliderSigma = document.getElementById("sigma");
const sliderRho = document.getElementById("rho");
const sliderBeta = document.getElementById("beta");
const radioXView = document.getElementById("x-view");
const radioYView = document.getElementById("y-view");
const radioZView = document.getElementById("z-view");
const resetButton = document.getElementById("reset-button");

radioXView.checked = false;
radioYView.checked = true;
radioZView.checked = false;

function updateControls() {
    sliderSigma.value = sigma;
    labelSpread.innerText = Number(sigma);
    sliderRho.value = rho;
    labelSpread.innerText = Number(rho);
  }

sliderSigma.addEventListener("change", function (event) {
    sigma = event.target.value;
    updateControls();
    step();
  });

  sliderRho.addEventListener("change", function (event) {
    rho = event.target.value;
    updateControls();
    step();
  });

  sliderBeta.addEventListener("change", function (event) {
    beta = event.target.value;
    updateControls();
    step();
  });

radioXView.addEventListener("click", function () {
    xView = true;
    radioXView.checked = xView;
    radioYView.checked = !xView;
    radioZView.checked = !xView;
    step();
  });

  resetButton.addEventListener("click", function () {
    dt = 0.01
    sigma = 10
    rho = 28
    beta = 2.6
    updateControls();
    step();
  });
  

function integrate({x, y, z}){
    x += (sigma*(y-x))  * dt
    y += (x*(rho-z) - y) * dt
    z += (x*y - beta*z) * dt
    return {x, y, z}
}

function extendPath(path, steps){
    [...Array(steps)].forEach(() => {
        const lastP = path[path.length - 1]
        const p = integrate(lastP)
        path.push(p)
    })
    return path
}

function scale(points, size){
    const mx = Math.min(...points.map(({x, y, z}) => x))
    const Mx = Math.max(...points.map(({x, y, z}) => x))
    const my = Math.min(...points.map(({x, y, z}) => y))
    const My = Math.max(...points.map(({x, y, z}) => y))
    const mz = Math.min(...points.map(({x, y, z}) => z))
    const Mz = Math.max(...points.map(({x, y, z}) => z))

    const s = (v, mv, Mv) => size * (v - mv) / (Mv - mv)
    return points.map( ({x, y, z}) => {
        x = s(x, mx, Mx)
        y = s(y, my, My)
        z = s(z, mz, Mz)
        return {x, y, z}
    })
}

var q = 0;
function drawPath(path){
    q += 0.01
    const map = ({x, y, z}) => [(x-300)*Math.cos(q) - (y-300)*Math.sin(q) + 300, z + 10]
    ctx.beginPath()
    path.map(map).forEach( p => ctx.lineTo(p[0] + canvas.width * 0.3, p[1]))
    ctx.stroke()
}

const path = [{x: 1, y: 1, z: 1}]

function step(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "rgb(220, 20, 60)";
    extendPath(path, 10)
    const scaled = scale(path, canvas.height - 20)
    drawPath(scaled)
    while (path.length > 1000) path.shift()
    setTimeout(step, 1000/60)
}
step()