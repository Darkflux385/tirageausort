const ADMIN_CODE = "1234"; // ← change ce code
const KEY = "tirage_participants";
const JOINED = "tirage_deja_inscrit";
const HKEY = "tirage_gagnants";
const $ = id => document.getElementById(id);
let players = [];
let history = [];
try { players = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
try { history = JSON.parse(localStorage.getItem(HKEY)) || []; } catch (e) {}

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(players)); } catch (e) {} };
const saveHist = () => { try { localStorage.setItem(HKEY, JSON.stringify(history)); } catch (e) {} };

function renderHistory() {
  $("historyCard").hidden = !history.length;
  $("history").innerHTML = "";
  history.slice().reverse().forEach(w => {
    const li = document.createElement("li");
    li.textContent = `${w.date} — ${w.pseudo} (Snap : ${w.snap})`;
    $("history").appendChild(li);
  });
}

let lastSnap = "";
function showWinner(text, snap) {
  lastSnap = snap || "";
  $("winner").hidden = false;
  $("winnerText").textContent = text;
  $("copy").hidden = !snap;
  $("copy").textContent = "📋 Copier le Snap du gagnant";
}

async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
  try {
    const t = document.createElement("textarea");
    t.value = txt; document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy");
    t.remove(); return ok;
  } catch (e) { return false; }
}

function render(hl = -1) {
  $("count").textContent = players.length;
  $("list").innerHTML = "";
  players.forEach((p, i) => {
    const c = document.createElement("span");
    c.className = "chip" + (i === hl ? " hl" : "");
    c.textContent = p.pseudo;
    $("list").appendChild(c);
  });
}

$("join").onclick = () => {
  const pseudo = $("pseudo").value.trim();
  const snap = $("snap").value.trim().replace(/^@/, "");
  if (!pseudo || !snap) { $("msg").textContent = "⚠️ Pseudo et Snap obligatoires !"; return; }
  let already = false;
  try { already = !!localStorage.getItem(JOINED); } catch (e) {}
  if (already || players.some(p => p.snap.toLowerCase() === snap.toLowerCase())) {
    $("msg").textContent = "🚫 Déjà inscrit(e) : une seule participation par personne !";
    return;
  }
  players.push({ pseudo, snap });
  save(); render();
  try { localStorage.setItem(JOINED, "1"); } catch (e) {}
  $("msg").textContent = "✅ Inscrit(e) ! Bonne chance 🍀";
  $("pseudo").value = ""; $("snap").value = "";
};

$("adminBtn").onclick = () => { $("adminPanel").hidden = !$("adminPanel").hidden; };

$("login").onclick = () => {
  if ($("code").value === ADMIN_CODE) {
    $("loginZone").hidden = true;
    $("adminZone").hidden = false;
  } else {
    $("adminMsg").textContent = "❌ Code incorrect";
  }
};

$("draw").onclick = () => {
  if (!players.length) { showWinner("Aucun participant !", ""); return; }
  $("winner").hidden = true;
  let n = 0;
  const t = setInterval(() => {
    render(Math.floor(Math.random() * players.length));
    if (++n > 25) {
      clearInterval(t);
      const i = Math.floor(Math.random() * players.length);
      render(i);
      const w = players[i];
      showWinner(`🏆 ${w.pseudo} — Snap : ${w.snap}`, w.snap);
      history.push({ pseudo: w.pseudo, snap: w.snap, date: new Date().toLocaleDateString("fr-FR") });
      saveHist(); renderHistory();
    }
  }, 100);
};

$("copy").onclick = async () => {
  const ok = await copyText(lastSnap);
  $("copy").textContent = ok ? "✅ Copié !" : "❌ Copie impossible : " + lastSnap;
};

$("clearHist").onclick = () => { history = []; saveHist(); renderHistory(); };

let armed = false;
$("reset").onclick = () => {
  if (!armed) {
    armed = true;
    $("reset").textContent = "Confirmer ? (re-clique)";
    setTimeout(() => { armed = false; $("reset").textContent = "Tout supprimer"; }, 3000);
    return;
  }
  armed = false;
  $("reset").textContent = "Tout supprimer";
  players = []; save(); render(); $("winner").hidden = true;
  try { localStorage.removeItem(JOINED); } catch (e) {}
};

render();
renderHistory();
