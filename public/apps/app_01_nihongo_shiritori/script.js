// =========================
// App01 ジェスチャーゲーム 完全版 script.js
// （操作性強化・一時停止・Undo・難易度・重複防止・トースト等）
// =========================

// --- お題データ（必要なら拡張可） ---
const topics = {
  animals: ["ゾウ", "ライオン", "犬", "ネコ", "カンガルー", "キリン"],
  jobs: ["医者", "先生", "警察官", "歌手", "シェフ"],
  actions: ["ジャンプ", "ダンス", "寝る", "お辞儀", "拍手"],
  hard: ["透明人間", "忍者", "宇宙飛行士", "マジシャン"]
};
const bonusRounds = ["声出し禁止", "片手だけで表現", "真顔のままで表現"];
const missions = ["5秒以内に正解", "同時に2人が正解", "3回連続で成功"];

// --- 状態 ---
let players = [], spectators = [], scores = {}, currentPlayerIndex = 0;
let totalRounds = 3, currentRound = 1, isTeamMode = false;
let currentCategory = "animals";
let teams = { A: [], B: [] };
let timer, timeLeft = 20;
let skipAvailable = false; // Added for skip mechanic

// Progress & combo (for Trend/Hit-game UI)
let combo = 0;
function updateProgressBar(forceRatio) {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  const total = totalRounds || 1;
  let ratio = (currentRound - 1) / total;
  if (typeof forceRatio === 'number') ratio = forceRatio;
  ratio = Math.max(0, Math.min(1, ratio));
  bar.style.width = (ratio * 100).toFixed(0) + '%';
}
function showCombo() {
  const hud = document.getElementById('comboHud');
  if (!hud) return;
  if (combo < 2) { hud.innerHTML = ''; return; }
  const div = document.createElement('div');
  div.textContent = `COMBO ×${combo}!`;
  div.style.display = 'inline-block';
  div.style.padding = '4px 10px';
  div.style.borderRadius = '999px';
  div.style.background = 'linear-gradient(90deg,#ff8ab6,#8ad8ff)';
  div.style.color = '#fff';
  div.style.fontWeight = '700';
  div.style.boxShadow = '0 6px 18px rgba(255,102,153,0.35)';
  div.style.transform = 'scale(0.9)';
  div.style.transition = 'transform 120ms ease, opacity 220ms ease';
  div.style.opacity = '0.98';
  hud.innerHTML = '';
  hud.appendChild(div);
  requestAnimationFrame(() => { div.style.transform = 'scale(1.05)'; });
  setTimeout(() => { div.style.opacity = '0'; }, 1000);
  setTimeout(() => { if (hud.contains(div)) hud.removeChild(div); }, 1400);
}

// UX向上用フラグとヘルパ
let paused = false;            // 一時停止状態
let startCooldown = false;     // 誤連打防止
let lastSubmission = null;     // Undo用

function vib(ms = 15) { if (navigator.vibrate) navigator.vibrate(ms); }
function showToast(msg, ms = 1800) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, ms);
}
function safeCallUpdateActionBar() { if (typeof window.updateActionBar === 'function') window.updateActionBar(); }
function scrollToTopOnMobile() { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 0); } }

// --- 難易度設定 ---
function getDifficultyCfg(){
  const d = document.getElementById('difficulty')?.value || 'normal';
  if (d === 'easy')  return { start: 25, bonusMul: 1.0 };
  if (d === 'hard')  return { start: 15, bonusMul: 1.25 };
  return { start: 20, bonusMul: 1.1 }; // normal
}

// --- お題の重複防止プール ---
const topicPool = { animals: [], jobs: [], actions: [], hard: [] };
function pickTopic(category){
  if (!topicPool[category] || topicPool[category].length === 0) {
    topicPool[category] = [...(topics[category] || [])].sort(() => Math.random() - 0.5);
  }
  return topicPool[category].pop();
}

// ============= 入力欄の追加/削除 =============
function addPlayerInput() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" class="large-button" placeholder="プレイヤー名" />`;
  document.getElementById("playerInputs").appendChild(div);
}
function removePlayerInput() {
  const container = document.getElementById("playerInputs");
  if (container.children.length > 3) container.removeChild(container.lastElementChild);
  else alert("最低3人必要です");
}
function addAudienceInput() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" class="large-button" placeholder="観客名" />`;
  document.getElementById("audienceInputs").appendChild(div);
}
function removeAudienceInput() {
  const container = document.getElementById("audienceInputs");
  if (container.children.length > 0) container.removeChild(container.lastElementChild);
}

// ============= セットアップ =============
function setupGame() {
  const playerInputs = document.querySelectorAll("#playerInputs input");
  const audienceInputs = document.querySelectorAll("#audienceInputs input");

  players = []; spectators = []; scores = {}; lastSubmission = null; paused = false;

  playerInputs.forEach(input => { const v = input.value.trim(); if (v) players.push(v); });
  audienceInputs.forEach(input => { const v = input.value.trim(); if (v) spectators.push(v); });
  if (players.length < 3) return alert("プレイヤーは3人以上を入力してください");

  currentCategory = document.getElementById("topicCategory").value;
  totalRounds = parseInt(document.getElementById("gameCount").value);
  currentRound = 1; currentPlayerIndex = 0;
  players.forEach(p => scores[p] = 0);

  const method = document.getElementById("teamMethod").value;
  if (method === "random") {
    teams.A = []; teams.B = [];
    players.forEach((p, i) => (i % 2 === 0 ? teams.A : teams.B).push(p));
    isTeamMode = true;
  } else if (method === "manual") {
    const mid = Math.ceil(players.length / 2);
    teams.A = players.slice(0, mid); teams.B = players.slice(mid);
    isTeamMode = true;
  } else { isTeamMode = false; }

  // BGM
  const bgm = document.getElementById("bgm");
  const choice = document.getElementById("bgmSelect")?.value || 'none';
  const srcMap = { cafe: "https://example.com/cafe.mp3", anime: "https://example.com/anime.mp3", party: "https://example.com/party.mp3" };
  if (choice !== "none" && srcMap[choice]) { bgm.src = srcMap[choice]; bgm.play().catch(()=>{}); }

  document.getElementById("setupScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("totalRounds").textContent = totalRounds;
  document.getElementById("roundNum").textContent = currentRound;
  combo = 0;
  updateProgressBar(0);
  updatePlayerDisplay();
  safeCallUpdateActionBar();
  scrollToTopOnMobile();
  vib();
}

// Wrapper function for countdown before starting the game
function startRound() {
  // 事前カウントダウン → startGame()
  const overlay = document.getElementById('countdown');
  const num = document.getElementById('countdownNum');
  if (!overlay || !num) { startGame(); return; }
  try { if (typeof tone === 'function') tone(660,0.1,'sine',0.08); } catch(e){}
  overlay.style.display = 'flex';
  const seq = ['3','2','1','GO!'];
  let i = 0;
  const step = () => {
    num.textContent = seq[i];
    num.style.animation = 'none'; void num.offsetWidth; num.style.animation = 'popIn 420ms ease';
    i++;
    if (i < seq.length) {
      setTimeout(step, 520);
    } else {
      setTimeout(() => {
        overlay.style.display = 'none';
        try { if (typeof tone === 'function') tone(880,0.12,'triangle',0.08); } catch(e){}
        startGame();
      }, 320);
    }
  };
  step();
}

function updatePlayerDisplay() {
  const current = players[currentPlayerIndex];
  const next = players[(currentPlayerIndex + 1) % players.length];
  document.getElementById("currentPlayerDisplay").textContent = `いまのプレイヤー：${current}`;
  document.getElementById("nextPlayerDisplay").textContent = `つぎのプレイヤー：${next}`;
  document.getElementById("instructionText").textContent = `${current}さんは「お題を表示してジェスチャーで表現！」`;
  document.getElementById("currentTeamDisplay").textContent = isTeamMode ? (teams.A.includes(current) ? "チームA" : "チームB") : "個人戦";
}

// ============= ゲーム開始・進行 =============
function startGame() {
  if (startCooldown) return;
  startCooldown = true; setTimeout(() => (startCooldown = false), 600);
  paused = false; updatePauseBtn(); vib(20);

  skipAvailable = true; // ラウンドごとに1回だけ
  const skipBtn = document.getElementById('skipBtn'); if (skipBtn) skipBtn.disabled = false;

  const { start } = getDifficultyCfg();
  const topic = pickTopic(currentCategory);
  document.getElementById("topicArea").textContent = "お題：" + topic;

  const isBonus = Math.random() < 0.3;
  document.getElementById("bonusText").textContent = isBonus ? "🎭 ボーナス：" + bonusRounds[Math.floor(Math.random() * bonusRounds.length)] : "";

  const mission = missions[Math.floor(Math.random() * missions.length)];
  document.getElementById("missionText").textContent = "🧩 追加チャレンジ：" + mission;

  timeLeft = start;
  document.getElementById("timer").textContent = `残り時間：${timeLeft}秒`;
  document.getElementById("timer").classList.add("pulse");

  clearInterval(timer);
  showScoreInputs();
  timer = setInterval(() => {
    if (paused) return; // 一時停止中は停止
    timeLeft--;
    document.getElementById("timer").textContent = `残り時間：${timeLeft}秒`;
    const t = document.getElementById('timer');
    if (timeLeft <= 10 && timeLeft > 0) t.classList.add('danger'); else t.classList.remove('danger');
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("timer").textContent = "時間切れ！";
      const t2 = document.getElementById('timer'); if (t2) t2.classList.remove('danger');
    }
  }, 1000);
}

function skipTopic() {
  if (!skipAvailable) { showToast('このラウンドのスキップは使用済み'); return; }
  if (timeLeft <= 3) { showToast('残り時間が少ないためスキップ不可'); return; }
  const next = pickTopic(currentCategory);
  document.getElementById('topicArea').textContent = 'お題：' + next;
  timeLeft = Math.max(0, timeLeft - 3); // 3秒ペナルティ
  const t = document.getElementById('timer');
  if (t) t.textContent = `残り時間：${timeLeft}秒`;
  skipAvailable = false;
  const btn = document.getElementById('skipBtn'); if (btn) btn.disabled = true;
  vib(6);
}

function showScoreInputs() {
  const area = document.getElementById("scoreInputArea");
  area.innerHTML = "";

  const currentPlayer = players[currentPlayerIndex];
  let scoringTargets = isTeamMode ? (teams.A.includes(currentPlayer) ? teams.A : teams.B) : [currentPlayer];
  scoringTargets = scoringTargets.filter(p => !spectators.includes(p));

  scoringTargets.forEach(p => {
    area.innerHTML += `
      <div style="margin:8px 0;">
        <label style="display:block; margin-bottom:6px; font-weight:600;">${p} の判定：</label>
        <select id="result_${p}" class="large-button">
          <option value="fail">❌ 未達</option>
          <option value="success">✅ 成功</option>
          <option value="great">🌟 パーフェクト</option>
        </select>
      </div>
    `;
  });
}

function submitScores() {
  vib(10);
  if (document.getElementById('gameArea').style.display === 'none') return;

  const { start, bonusMul } = getDifficultyCfg();
  const currentPlayer = players[currentPlayerIndex];
  const scoringTargets = isTeamMode ? (teams.A.includes(currentPlayer) ? teams.A : teams.B) : [currentPlayer];

  const details = []; // Undo用詳細
  scoringTargets.forEach(p => {
    if (spectators.includes(p)) return;
    const sel = document.getElementById(`result_${p}`);
    if (!sel) return;
    const result = sel.value;
    let base = result === "fail" ? 0 : result === "success" ? 5 : 7;
    let bonus = Math.min(Math.round(timeLeft * 0.2 * bonusMul), 8);
    if (timeLeft >= Math.floor(start * 0.75)) bonus += 3;
    const delta = base + bonus;
    scores[p] = (scores[p] || 0) + delta;
    details.push({ p, delta });
  });

  // 視覚フィードバック：合計 +score ポップ
  const area = document.getElementById('scoreInputArea');
  if (area && details.length) {
    const totalDelta = details.reduce((s,d)=>s+d.delta,0);
    const pop = document.createElement('span');
    pop.className = 'score-pop' + (details.some(d=>d.delta>=7) ? ' great' : '');
    pop.textContent = '+' + totalDelta;
    const rect = area.getBoundingClientRect();
    pop.style.left = (rect.width/2 - 8) + 'px';
    pop.style.top = '0px';
    pop.style.position = 'absolute';
    area.style.position = 'relative';
    area.appendChild(pop);
    setTimeout(()=> pop.remove(), 1100);
  }

  const succeeded = details.some(d => d.delta > 0);
  combo = succeeded ? (combo + 1) : 0;
  showCombo();

  lastSubmission = { details };
  const undoBtn = document.getElementById('undoBtn'); if (undoBtn) undoBtn.disabled = details.length === 0;
  if (details.some(d => d.delta >= 7)) { // パーフェクト相当
    if (typeof shootConfetti === 'function') shootConfetti(20);
  }

  if (details.length) {
    const best = details.slice().sort((a,b)=>b.delta-a.delta)[0];
    if (best) showToast(`ハイライト：${best.p} +${best.delta}点`);
  }

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  if (currentRound < totalRounds) {
    currentRound++;
    document.getElementById("roundNum").textContent = currentRound;
    updateProgressBar();
    resetGame();
    updatePlayerDisplay();
    safeCallUpdateActionBar();
  } else {
    showScoreBoard();
  }
}

function resetGame() {
  clearInterval(timer);
  document.getElementById("topicArea").textContent = "ここにお題が表示されます";
  document.getElementById("bonusText").textContent = "";
  document.getElementById("missionText").textContent = "";
  document.getElementById("scoreInputArea").innerHTML = "";
  vib(8);
  document.getElementById("timer").classList.remove("pulse");
  const td = document.getElementById('timer'); if (td) td.classList.remove('danger');
}

function showScoreBoard() {
  // 画面切替とエフェクト整理
  document.getElementById("gameArea").style.display = "none";
  const t = document.getElementById('timer'); if (t) t.classList.remove('danger');
  updateProgressBar(1);
  const bar = document.getElementById('progressBar'); if (bar) bar.setAttribute('aria-valuenow','100');
  document.getElementById("timer").classList.remove("pulse");
  safeCallUpdateActionBar();

  // スコア集計とランキング（同率対応）
  const board = document.getElementById("scoreBoard");
  board.innerHTML = "";
  const entries = Object.entries(scores);
  if (entries.length === 0) {
    board.innerHTML = '<li>スコアがありません</li>';
  } else {
    // 降順ソート
    entries.sort((a,b) => b[1] - a[1]);

    // 同率ランク算出
    let rank = 0, prevScore = null, actualIndex = 0;
    const rows = entries.map(([name, score]) => {
      actualIndex++;
      if (score !== prevScore) { rank = actualIndex; prevScore = score; }
      let medal = '';
      if (rank === 1) medal = '🥇';
      else if (rank === 2) medal = '🥈';
      else if (rank === 3) medal = '🥉';
      return { name, score, rank, medal };
    });

    // 表示
    rows.forEach(({name, score, rank, medal}) => {
      board.innerHTML += `<li>${medal ? medal + ' ' : ''}${name}: ${score} 点</li>`;
    });

    // MVP（同率複数対応）
    const topScore = rows[0].score;
    const mvps = rows.filter(r => r.score === topScore).map(r => r.name);
    if (mvps.length === 1) {
      document.getElementById("mvpDisplay").textContent = `👑 MVPは ${mvps[0]} さん！おめでとう！`;
    } else {
      document.getElementById("mvpDisplay").textContent = `👑 同率MVP: ${mvps.join('、')} さん！すごい！`;
    }
  }

  // 結果表示とお祝いエフェクト
  document.getElementById("scoreDisplay").style.display = "block";
  if (typeof shootConfetti === 'function') shootConfetti(50);
  showToast('結果発表！MVPをチェックしよう');
}

function saveResultImage() {
  html2canvas(document.querySelector("#scoreDisplay")).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    const dt = new Date();
    const y = dt.getFullYear(), m = (dt.getMonth()+1+'').padStart(2,'0'), d = (dt.getDate()+'').padStart(2,'0');
    a.download = `gesture_result_${y}${m}${d}.png`;
    a.click();
  });
}

function returnToTitle() {
  clearInterval(timer);
  document.getElementById("setupScreen").style.display = "block";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("scoreDisplay").style.display = "none";
  document.getElementById("scoreInputArea").innerHTML = "";
  document.getElementById("scoreBoard").innerHTML = "";
  document.getElementById("mvpDisplay").innerHTML = "";
  document.getElementById("topicArea").textContent = "ここにお題が表示されます";
  document.getElementById("timer").textContent = "残り時間：--秒";
  combo = 0;
  updateProgressBar(0);
  safeCallUpdateActionBar();
  scrollToTopOnMobile();
}

function forceEnd() {
  clearInterval(timer);
  document.getElementById("timer").textContent = "手動で終了しました";
  safeCallUpdateActionBar();
}

// ============= 一時停止 / 再開 =============
function togglePause(){
  if (document.getElementById('gameArea').style.display === 'none') return;
  paused = !paused; updatePauseBtn(); vib(8);
}
function updatePauseBtn(){
  const btn = document.getElementById('pauseBtn');
  if (!btn) return;
  btn.innerHTML = paused ? `<i class="fa-solid fa-play"></i> 再開` : `<i class="fa-solid fa-pause"></i> 一時停止`;
}

// ============= Undo（直前の送信を取り消し） =============
function undoLast(){
  if (!lastSubmission) return;
  const { details } = lastSubmission;
  details.forEach(({p, delta}) => { scores[p] -= delta; });
  lastSubmission = null;
  const undoBtn = document.getElementById('undoBtn'); if (undoBtn) undoBtn.disabled = true;
  showToast('直前のスコア送信を取り消しました');
}

function shootConfetti(count = 36) {
  const container = document.getElementById('confetti');
  if (!container) return;
  const emojis = ["🎉","✨","💖","⭐️","🍬","🌸","🥳"];
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'confetti-piece';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const startX = Math.random() * window.innerWidth;
    const drift = (Math.random() * 140 - 70) + 'px';
    span.style.left = startX + 'px';
    span.style.setProperty('--x', drift);
    span.style.animationDuration = (700 + Math.random() * 600) + 'ms';
    container.appendChild(span);
    setTimeout(() => span.remove(), 1500);
  }
}
