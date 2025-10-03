// DOM-элементы
const canvas = document.querySelector('.graph canvas');
const ctx = canvas.getContext('2d');

const xGroup = document.getElementById('xGroup');
const xGroupInputs = xGroup.querySelectorAll('input');
const yInput = document.getElementById('yInput');
const rButtons = document.querySelectorAll('.r-button');
const form = document.getElementById('coordsForm');
const historyTbody = document.getElementById('history');
const clearHistoryBtn = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');

// начальные значения
let selectedR = 1;
const AXIS_MIN = -6;
const AXIS_MAX = 6;

// fetch c отловом ошибок
async function fetchWithAlert(url) {
    const res = await fetch(url);
    if (!res.ok) {
        let msg;
        try {
            const data = await res.json();
            msg = data.reason || data.error || JSON.stringify(data);
        } catch {
            msg = await res.text()
        }
        alert(`Ошибка: ${res.status} ${msg}`);
        throw new Error(msg);
    }
    return res;
}

// сохранение состояния
async function saveState() {
    const selectedXs = [...xGroup.querySelectorAll("input:checked")].map(cb=>parseFloat(cb.value));
    const theme = document.body.classList.contains("dark") ? "dark":"light";
    const yRaw = yInput.value.trim();
    const y = yRaw === "" ? "" : parseFloat(yRaw.replace(',','.'));
    
    const params = new URLSearchParams();
    params.append("selectedXs", selectedXs.join(","));
    params.append("y", y === "" ? "" : y.toFixed(2));
    params.append("r", selectedR);
    params.append("theme", theme);

    await fetchWithAlert(`/api/state/update?${params.toString()}`);
}

// загрузка состояния
async function loadState() {
    try {
        const res = await fetchWithAlert('/api/state/get');
        const state = await res.json();

        // тема
        if(state.theme==="dark"){
            document.body.classList.add("dark");
            themeToggle.textContent = "☀️ Светлая";
        } else {
            document.body.classList.remove("dark");
            themeToggle.textContent = "🌙 Тёмная";
        }

        // X
        if (state.selectedXs) {
            xGroupInputs.forEach(cb => {
                cb.checked = state.selectedXs.includes(parseFloat(cb.value));
                cb.parentElement.classList.toggle("active", cb.checked);
            });
        }

        // Y
        if(state.y !== null && state.y !== undefined && state.y !== ""){
            yInput.value = state.y;

            const yVal = parseFloat(state.y);
            if(isNaN(yVal) || yVal < -5 || yVal > 3){
                yInput.classList.add("invalid");
            } else {
                yInput.classList.remove("invalid");
            }
        } else {
            yInput.value = "";
            yInput.classList.remove("invalid");
        }

        // R
        if (state.r) {
            selectedR = state.r;
            rButtons.forEach(b => b.classList.toggle("active", parseFloat(b.dataset.r) === selectedR));
        }

        // canvas
        setupCanvas();

        // история
        await loadHistory();
    } catch (err) {
        console.error("Ошибка при загрузке состояния:", err);
    }
}

// загрузка истории
async function loadHistory() {
    const res = await fetchWithAlert('/api/history/get');
    const history = await res.json();

    history.sort((a, b) => new Date(a.now) - new Date(b.now));
    
    historyTbody.innerHTML = "";
    history.forEach(item => {
        addHistoryItem(item);
        drawPoint(item.point.x, item.point.y, item.result);
    });
}

// canvas
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function scaleX(x) { const rect = canvas.getBoundingClientRect(); return rect.width/2 + x*(rect.width/(2*AXIS_MAX)); }
function scaleY(y) { const rect = canvas.getBoundingClientRect(); return rect.height/2 - y*(rect.height/(2*AXIS_MAX)); }

function drawAxes() {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;

  ctx.strokeStyle = "#000"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w/2,0); ctx.lineTo(w/2,h); ctx.stroke();

  ctx.fillStyle="#000"; ctx.font="12px Arial";
  for(let i=AXIS_MIN;i<=AXIS_MAX;i++){
    if(i===0) continue;
    ctx.fillText(i, scaleX(i), h/2-5);
    ctx.fillText(i, w/2+5, scaleY(i));
  }
}

function drawArea() {
  const R = selectedR;
  ctx.fillStyle = "rgba(0,128,255,0.3)";

  // прямоугольник
  ctx.fillRect(scaleX(0), scaleY(0), scaleX(R/2)-scaleX(0), scaleY(-R)-scaleY(0));

  // треугольник
  ctx.beginPath();
  ctx.moveTo(scaleX(-R),scaleY(0));
  ctx.lineTo(scaleX(0),scaleY(0));
  ctx.lineTo(scaleX(0),scaleY(-R/2));
  ctx.closePath(); ctx.fill();

  // четверть круга
  ctx.beginPath();
  ctx.moveTo(scaleX(0),scaleY(0));
  ctx.arc(scaleX(0), scaleY(0), scaleX(R/2)-scaleX(0), Math.PI, Math.PI*1.5, false);
  ctx.closePath(); ctx.fill();
}

function drawPoint(x,y,result) {
  ctx.beginPath();
  ctx.arc(scaleX(x),scaleY(y),4,0,2*Math.PI);
  ctx.fillStyle = result ? "green":"red";
  ctx.fill();
}

// история попаданий
function addHistoryItem(item) {
  const { point, result, now, exec_time } = item;
  const { x, y, r } = point;
  const emoji = result?"✔️":"❌";
  const row = document.createElement("tr");
  row.className = result?"history-item hit":"history-item miss";
  row.innerHTML = `<td>${now}</td><td>${emoji}</td><td>${x}</td><td>${y.toFixed(2)}</td><td>${r}</td><td>${exec_time} ms</td>`;
  historyTbody.prepend(row);
}

// слушатели событий
xGroup.addEventListener("change", e => {
    if(e.target.tagName==="INPUT"){
        e.target.parentElement.classList.toggle("active", e.target.checked);
        saveState();
    }
});

yInput.addEventListener("input", ()=>{
    let val = yInput.value;

    val = val.replace(/[^0-9.,-]/g, "");

    if (val.includes("-")) {
        val = "-" + val.replace(/-/g, "");
    }

    val = val.replace(",", ".");

    const firstDot = val.indexOf(".");
    if (firstDot !== -1) {
        val = val.slice(0, firstDot + 1) + val.slice(firstDot + 1).replace(/\./g, "");
    }

    val = val.replace(/^(-?)0+(\d)/, "$1$2");

    yInput.value = val;

    const y = parseFloat(val);
    if (isNaN(y) || y < -5 || y > 3) {
        yInput.classList.add("invalid");
    } else {
        yInput.classList.remove("invalid");
    }

    saveState();
});

rButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        rButtons.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        selectedR = parseFloat(btn.dataset.r);
        saveState();
        setupCanvas();
    });
});

themeToggle.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Светлая":"🌙 Тёмная";
    saveState();
});

// отправка формы
form.addEventListener("submit", async e=>{
    e.preventDefault();

    const selectedXs = [...xGroup.querySelectorAll("input:checked")].map(cb=>parseFloat(cb.value));
    const y = parseFloat(yInput.value.trim().replace(',','.'));

    if(isNaN(y) || y<-5 || y>3){
        alert("Введите корректное Y: от -5 до 3"); return;
    }
    if(selectedXs.length===0){ alert("Выберите хотя бы один X."); return; }
    if(!selectedR){ alert("Выберите R."); return; }

    setupCanvas();

    try {
        const query = selectedXs.map(x=>`x=${x}`).join("&") + `&y=${y.toFixed(2)}&r=${selectedR}`;
        const response = await fetchWithAlert(`/api/check?${query}`);
        const resultJSON = await response.json();

        let currentPoints = [];

        resultJSON.results.forEach(e=>{
            drawPoint(e.point.x,e.point.y,e.result);
            addHistoryItem({...e, exec_time:resultJSON.exec_time});
            currentPoints.push(e);
        });

        saveState();

    } catch(err){
        console.error(err);
        alert(err.message);
    }
});

// очистка истории
clearHistoryBtn.addEventListener("click", async ()=>{
    await fetchWithAlert("/api/history/clear");
    historyTbody.innerHTML="";
    setupCanvas();
    saveState();
});

// инициализация
function setupCanvas(){
    resizeCanvas();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAxes();
    drawArea();
}
document.addEventListener("DOMContentLoaded", async ()=>{
    await loadState();
    setupCanvas();
});