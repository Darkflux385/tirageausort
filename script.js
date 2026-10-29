const ADMIN_CODE = "1234"; // ← change ce code
const KEY = "tirage_participants";
const JOINED = "tirage_deja_inscrit";
const $ = id => document.getElementById(id);
let players = [];
try { players = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(players)); } catch (e) {} };

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
  if (!players.length) { $("winner").hidden = false; $("winner").textContent = "Aucun participant !"; return; }
  $("winner").hidden = true;
  let n = 0;
  const t = setInterval(() => {
    render(Math.floor(Math.random() * players.length));
    if (++n > 25) {
      clearInterval(t);
      const i = Math.floor(Math.random() * players.length);
      render(i);
      $("winner").hidden = false;
      $("winner").textContent = `🏆 ${players[i].pseudo} — Snap : ${players[i].snap}`;
    }
  }, 100);
};

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
