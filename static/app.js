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
const MAX_HISTORY = 10;

// адаптивный canvas
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// преобразование координат
function scaleX(x) {
  const rect = canvas.getBoundingClientRect();
  return rect.width / 2 + x * (rect.width / (2 * AXIS_MAX));
}
function scaleY(y) {
  const rect = canvas.getBoundingClientRect();
  return rect.height / 2 - y * (rect.height / (2 * AXIS_MAX));
}

// отображение осей
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

  // подписи осей
  ctx.fillStyle = "#000";
  ctx.font = "12px Arial";
  for (let i = AXIS_MIN; i <= AXIS_MAX; i++) {
    if (i === 0) continue;
    ctx.fillText(i, scaleX(i), h / 2 - 5);
    ctx.fillText(i, w / 2 + 5, scaleY(i));
  }
}

// область попадания
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
  ctx.arc(scaleX(0), scaleY(0), scaleX(R / 2) - scaleX(0), Math.PI, Math.PI * 1.5, false);
  ctx.closePath();
  ctx.fill();
}

// отрисовка точки
function drawPoint(x, y, result) {
  ctx.beginPath();
  ctx.arc(scaleX(x), scaleY(y), 4, 0, 2 * Math.PI);
  ctx.fillStyle = result ? "green" : "red";
  ctx.fill();
}

// история попаданий
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

  // максимальное количество строк в таблице (10)
  while (historyTbody.children.length > MAX_HISTORY) {
    historyTbody.removeChild(historyTbody.lastChild);
  }
}

// сохранение состояния
function saveState(points) {
    const selectedXs = [...xGroup.querySelectorAll("input:checked")].map(cb => parseFloat(cb.value));
    const state = {
        theme: document.body.classList.contains("dark") ? "dark" : "light",
        selectedR: selectedR,
        selectedXs: selectedXs,
        y: yInput.value,
        lastPoints: points,        
        historyHTML: historyTbody.innerHTML 
    };
    localStorage.setItem("hitCheckerState", JSON.stringify(state));
}

// загрузка состояния
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

        setupCanvas();

        if (state.lastPoints) {
            state.lastPoints.forEach(p => drawPoint(p.x, p.y, p.result));
        }

        if (state.historyHTML) {
            historyTbody.innerHTML = state.historyHTML;
        }
    } catch (e) {
        console.error("Ошибка восстановления состояния:", e);
    }
}

// слушатели событий
xGroup.addEventListener("change", e => {
  if (e.target.tagName === "INPUT") {
    e.target.parentElement.classList.toggle("active", e.target.checked);
    saveState();
  }
});

yInput.addEventListener("input", () => {
    const yRaw = yInput.value.trim();
    const y = parseFloat(yRaw.replace(',', '.'));
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
    setupCanvas();
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Светлая" : "🌙 Тёмная";
  saveState();
});

// отправка формы
form.addEventListener("submit", async e => {
  e.preventDefault();

  const selectedXs = [...xGroup.querySelectorAll("input:checked")].map(cb => parseFloat(cb.value));
  const y = parseFloat(yInput.value.trim().replace(',', '.'));
  if (isNaN(y) || y < -5 || y > 3) {
    yInput.classList.add("invalid");
    alert("Введите корректное Y: от -5 до 3");
    return; 
  } else {
    yInput.classList.remove("invalid");
  }

  if (selectedXs.length === 0) {
    alert("Выберите хотя бы один X.");
    return;
  }

  if (!selectedR) {
    alert("Выберите значение R.");
    return;
  }


  setupCanvas();

  try {
    const query = selectedXs.map(x => `x=${x}`).join("&") + `&y=${y.toFixed(2)}&r=${selectedR}`;
    const response = await fetch(`/api/check?${query}`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка сервера: ${response.status} ${text}`);
    }
    const resultJSON = await response.json();

    let currentPoints = []; // точки текущей проверки

    // После успешного ответа от сервера:
    currentPoints = resultJSON.results.map(p => {
        drawPoint(p.x, p.y, p.result);
        addHistoryItem({ ...p, r: selectedR, now: resultJSON.now, exec_time: resultJSON.exec_time });
        return p;
    });

    // Сохраняем состояние
    saveState(currentPoints);

  } catch (err) {
    console.error("Ошибка запроса:", err);
    alert(err.message);
  }
});

// очистка истории
clearHistoryBtn.addEventListener("click", () => {
  historyTbody.innerHTML = "";
  setupCanvas();
  saveState();
});

// инициализация
function setupCanvas() {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxes();
  drawArea();
}

loadState();
setupCanvas();