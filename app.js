/* ================= CONFIG ================= */

const API = {};

const REFRESH_INTERVAL = 5000;


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMarketLayer();
  startSystem();
});


/* ================= THEME ================= */

function initTheme() {
  const btn = document.getElementById("theme-toggle");

  if (!btn) return;

  btn.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });
}


/* ================= MAIN LOOP ================= */

function startSystem() {
  runCycle();

  setInterval(() => {
    runCycle();
  }, REFRESH_INTERVAL);
}

function runCycle() {

  fetchTelegramNotifications(); // 🔥 ADD THIS

  setTimeout(updateGlobalStatus, 500);
}


/* ================= FETCH ================= */

async function fetchTrading(name, url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Network error: ${res.status}`);
    }

    const data = await res.json();
    updateTradingCard(name, data, true);

  } catch (err) {
    console.error(`Trading fetch failed for ${name}:`, err);
    updateTradingCard(name, null, false);
  }
}


/* ================= UPDATE UI ================= */

function updateTradingCard(name, data, isOnline) {
  const balanceEl = document.getElementById(`${name}-balance`);
  const pnlEl = document.getElementById(`${name}-pnl`);
  const tradeEl = document.getElementById(`${name}-trade`);
  const card = document.querySelector(`[data-ai="${name}"]`);

  if (!balanceEl || !pnlEl || !tradeEl || !card) return;

  /* ===== OFFLINE ===== */
  if (!isOnline || !data) {
    balanceEl.innerText = "--";
    pnlEl.innerText = "--";
    tradeEl.innerText = "OFFLINE";

    pnlEl.style.color = "#ff4d4d";
    tradeEl.style.color = "#ff4d4d";
    card.classList.remove("active");

    return;
  }

  /* ===== BALANCE ===== */
  const balance = safeNumber(data.balance, null);
  balanceEl.innerText = balance === null ? "--" : formatCurrency(balance);

  /* ===== PNL ===== */
  const pnl = safeNumber(data.pnl, null);
  pnlEl.innerText = pnl === null ? "--" : formatCurrency(pnl);

  if (pnl === null) {
    pnlEl.style.color = "";
    card.classList.remove("active");
  } else if (pnl >= 0) {
    pnlEl.style.color = "#00ffc8";
    card.classList.add("active");
  } else {
    pnlEl.style.color = "#ff4d4d";
    card.classList.remove("active");
  }

  /* ===== TRADE ===== */
  if (Array.isArray(data.positions) && data.positions.length > 0) {
    const trade = data.positions[0];

    const symbol = trade.symbol || "UNKNOWN";
    const side = trade.type || trade.side || "TRADE";
    const tradePnl = safeNumber(trade.pnl, null);

    tradeEl.innerText =
      tradePnl === null
        ? `${symbol} ${side}`
        : `${symbol} ${side} ${formatCurrency(tradePnl)}`;

    tradeEl.style.color = tradePnl === null
      ? ""
      : tradePnl >= 0
        ? "#00ffc8"
        : "#ff4d4d";
  } else {
    tradeEl.innerText = "No Active Trade";
    tradeEl.style.color = "";
  }
}


/* ================= GLOBAL STATUS ================= */

function updateGlobalStatus() {
  const pnlValues = ["wolf", "cwolf", "fwolf", "swolf"].map((name) => {
    const el = document.getElementById(`${name}-pnl`);
    return el ? el.innerText.trim() : "--";
  });

  const tradeValues = ["wolf", "cwolf", "fwolf", "swolf"].map((name) => {
    const el = document.getElementById(`${name}-trade`);
    return el ? el.innerText.trim() : "OFFLINE";
  });

  const globalEl = document.getElementById("system-status");
  if (!globalEl) return;

  const hasOffline = tradeValues.includes("OFFLINE");
  const hasConnecting = pnlValues.includes("--");

  if (hasOffline) {
    globalEl.innerText = "PARTIAL SYSTEM FAILURE";
    globalEl.style.color = "#ff4d4d";
    return;
  }

  if (hasConnecting) {
    globalEl.innerText = "CONNECTING TO AI SYSTEMS";
    globalEl.style.color = "#ffb347";
    return;
  }

  globalEl.innerText = "ALL SYSTEMS OPERATIONAL";
  globalEl.style.color = "#00ffc8";
}


/* ================= MARKET PARTICLE SYSTEM ================= */

function initMarketLayer() {
  const layer = document.getElementById("market-layer");
  if (!layer) return;

  layer.innerHTML = "";

  const count = 40;
  const spacing = 2.5; // vw

  for (let i = 0; i < count; i++) {
    const candle = document.createElement("div");
    candle.className = "candle";

    const body = document.createElement("div");
    body.className = "candle-body";

    const high = Math.random() * 120 + 40;
    const low = Math.random() * 40;
    const open = Math.random() * (high - low) + low;
    const close = Math.random() * (high - low) + low;

    const isUp = close > open;
    candle.classList.add(isUp ? "up" : "down");

    candle.style.height = `${high}px`;
    candle.style.left = `${i * spacing}vw`;
    candle.style.animation = `candleMove ${3 + Math.random() * 3}s ease-in-out infinite`;

    const bodyHeight = Math.max(Math.abs(close - open), 8);
    const bodyBottom = Math.min(open, close);

    body.style.height = `${bodyHeight}px`;
    body.style.bottom = `${bodyBottom}px`;

    candle.appendChild(body);
    layer.appendChild(candle);
  }
}


/* ================= HELPERS ================= */

function formatCurrency(num) {
  return "₹ " + Number(num).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function logout() {
  localStorage.removeItem("auth");
  window.location.href = "login.html";
}
document.getElementById("logout-btn").onclick = () => {

  document.body.innerHTML = `
    <div style="color:#ff4d4d; font-family:Orbitron; text-align:center; margin-top:20%;">
      > TERMINATING SESSION...<br><br>
      > DISCONNECTING WOLF CORE...
    </div>
  `;

  setTimeout(() => {
    localStorage.removeItem("auth");
    window.location.href = "login.html";
  }, 1200);
};
/* ================= TELEGRAM ================= */

async function fetchTelegramNotifications() {
  try {
    const res = await fetch("/api/telegram");
    const data = await res.json();

    updateNotification("wolf", data.wolf);
    updateNotification("cwolf", data.cwolf);
    updateNotification("fwolf", data.fwolf);
    updateNotification("swolf", data.swolf);

  } catch (err) {
    console.error("Telegram fetch failed", err);
  }
}

function updateNotification(name, text) {
  let el = document.getElementById(`${name}-notif`);

  if (!el) {
    const card = document.querySelector(`[data-ai="${name}"]`);
    if (!card) return;

    el = document.createElement("div");
    el.id = `${name}-notif`;
    el.className = "notif-box";

    card.appendChild(el);
  }

  // ===== HANDLE EMPTY =====
  if (!text || text === "--") {
    el.innerText = "--";
    el.style.color = "#aaa";
    return;
  }

  const lower = text.toLowerCase();

  // ===== BUY SIGNAL =====
  if (lower.includes("buy")) {
    el.innerHTML = `▲ ${text}`;
    el.style.color = "#00ffc8";

    // glow effect
    el.style.textShadow = "0 0 8px #00ffc8";
  }

  // ===== SELL SIGNAL =====
  else if (lower.includes("sell")) {
    el.innerHTML = `▼ ${text}`;
    el.style.color = "#ff4d4d";

    // glow effect
    el.style.textShadow = "0 0 8px #ff4d4d";
  }

  // ===== HOLD / OTHER =====
  else {
    el.innerText = text;
    el.style.color = "#ccc";
    el.style.textShadow = "none";
  }
}