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

let selectedR = 1;
const AXIS_MIN = -6;
const AXIS_MAX = 6;

let points = []; // массив для хранения всех нарисованных точек

// === адаптивный canvas ===
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// === преобразование координат ===
function scaleX(x) {
  const rect = canvas.getBoundingClientRect();
  return rect.width / 2 + x * (rect.width / (2 * AXIS_MAX));
}
function scaleY(y) {
  const rect = canvas.getBoundingClientRect();
  return rect.height / 2 - y * (rect.height / (2 * AXIS_MAX));
}

// === оси ===
function drawAxes() {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  // ось X
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // ось Y
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  // подписи
  ctx.fillStyle = "#000";
  ctx.font = "12px Arial";
  for (let i = AXIS_MIN; i <= AXIS_MAX; i++) {
    if (i === 0) continue;
    ctx.fillText(i, scaleX(i), h / 2 - 5);
    ctx.fillText(i, w / 2 + 5, scaleY(i));
  }
}

// === область попадания ===
function drawArea() {
  const R = selectedR;
  ctx.fillStyle = "rgba(0,128,255,0.3)";

  // прямоугольник
  ctx.fillRect(scaleX(0), scaleY(0), scaleX(R / 2) - scaleX(0), scaleY(-R) - scaleY(0));

  // треугольник
  ctx.beginPath();
  ctx.moveTo(scaleX(-R), scaleY(0));
  ctx.lineTo(scaleX(0), scaleY(0));
  ctx.lineTo(scaleX(0), scaleY(-R / 2));
  ctx.closePath();
  ctx.fill();

  // четверть круга
  ctx.beginPath();
  ctx.moveTo(scaleX(0), scaleY(0));
  ctx.arc(scaleX(0), scaleY(0), scaleX(R / 2) - scaleX(0), Math.PI, 1.5 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
}

// === точка ===
function drawPoint(x, y, result) {
  ctx.beginPath();
  ctx.arc(scaleX(x), scaleY(y), 4, 0, 2 * Math.PI);
  ctx.fillStyle = result ? "green" : "red";
  ctx.fill();
}

// перерисовать все сохранённые точки
function drawPoints() {
  points.forEach(p => drawPoint(p.x, p.y, p.result));
}

// === история ===
function addHistoryItem(item) {
  const { x, y, r, result, now, exec_time } = item;
  const emoji = result ? "✔️" : "❌";

  const row = document.createElement("tr");
  row.className = result ? "history-item hit" : "history-item miss";
  row.innerHTML = `
    <td>${now}</td>
    <td>${emoji}</td>
    <td>${x}</td>
    <td>${y.toFixed(2)}</td>
    <td>${r}</td>
    <td>${exec_time} ms</td>
  `;
  historyTbody.prepend(row);

  // ограничение: максимум 10 записей
  while (historyTbody.children.length > 10) {
    historyTbody.removeChild(historyTbody.lastChild);
  }
}

// === сохранение состояния ===
function saveState() {
  const selectedXs = [...xGroup.querySelectorAll("input:checked")].map(cb => parseFloat(cb.value));
  const state = {
    theme: document.body.classList.contains("dark") ? "dark" : "light",
    selectedR: selectedR,
    selectedXs: selectedXs,
    y: yInput.value,
    points: points
  };
  localStorage.setItem("hitCheckerState", JSON.stringify(state));
}

// === загрузка состояния ===
function loadState() {
  const saved = localStorage.getItem("hitCheckerState");
  if (!saved) return;
  try {
    const state = JSON.parse(saved);
    if (state.theme === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️ Светлая";
    }
    if (state.selectedR) selectedR = state.selectedR;
    rButtons.forEach(btn => btn.classList.toggle("active", parseFloat(btn.dataset.r) === selectedR));
    if (state.selectedXs) {
      xGroupInputs.forEach(cb => {
        cb.checked = state.selectedXs.includes(parseFloat(cb.value));
        cb.parentElement.classList.toggle("active", cb.checked);
      });
    }
    if (state.y !== undefined) yInput.value = state.y;
    if (state.points) {
      points = state.points;
      historyTbody.innerHTML = "";
      points.slice(-10).reverse().forEach(p => addHistoryItem(p));
    }
  } catch (e) {
    console.error("Ошибка восстановления:", e);
  }
}

// === события ===
xGroup.addEventListener("change", e => {
  if (e.target.tagName === "INPUT") {
    e.target.parentElement.classList.toggle("active", e.target.checked);
    saveState();
  }
});

yInput.addEventListener("input", () => {
  const y = parseFloat(yInput.value);
  if (isNaN(y) || y < -5 || y > 3) {
    yInput.classList.add("invalid");
  } else {
    yInput.classList.remove("invalid");
  }
  saveState();
});

rButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    rButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedR = parseFloat(btn.dataset.r);
    saveState();
    setupCanvas(); // перерисовка области + осей + текущих точек
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Светлая" : "🌙 Тёмная";
  saveState();
});

// === форма ===
form.addEventListener("submit", async e => {
  e.preventDefault();

  const selectedXs = [...xGroup.querySelectorAll("input:checked")].map(cb => parseFloat(cb.value));
  const y = parseFloat(yInput.value);
  if (isNaN(y) || selectedXs.length === 0 || !selectedR) {
    alert("Выберите хотя бы один X, введите корректный Y и выберите R.");
    return;
  }

  // удаляем старые точки перед новой проверкой
  points = [];
  setupCanvas(); // очистка канваса + перерисовка осей и области

  for (const x of selectedXs) {
    try {
      const response = await fetch(`/api/check?x=${x}&y=${y.toFixed(2)}&r=${selectedR}`);
      if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
      const resultJSON = await response.json();

      const point = { 
        x, 
        y, 
        result: resultJSON.result,
        now: resultJSON.now,
        exec_time: resultJSON.exec_time,
        r: selectedR
      };

      points.push(point);           // сохраняем точку
      drawPoint(x, y, resultJSON.result); // рисуем точку
      addHistoryItem(point);        // добавляем в историю
      saveState();                  // сохраняем состояние
    } catch (err) {
      console.error("Ошибка запроса:", err);
      alert(err.message);
    }
  }
});

// === очистка истории ===
clearHistoryBtn.addEventListener("click", () => {
  historyTbody.innerHTML = "";
  points = [];
  setupCanvas();
  saveState();
});

// === инициализация ===
function setupCanvas() {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxes();
  drawArea();
  drawPoints(); // рисуем только точки из массива points (только новые)
}

window.addEventListener("resize", setupCanvas);

loadState();
setupCanvas();