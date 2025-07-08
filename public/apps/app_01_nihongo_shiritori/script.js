const topics = {
  animals: ["ゾウ", "ライオン", "犬", "ネコ", "カンガルー", "キリン"],
  jobs: ["医者", "先生", "警察官", "歌手", "シェフ"],
  actions: ["ジャンプ", "ダンス", "寝る", "お辞儀", "拍手"],
  hard: ["透明人間", "忍者", "宇宙飛行士", "マジシャン"]
};

const bonusRounds = ["音声禁止", "片手のみで表現", "逆立ちのフリをする"];
const missions = ["5秒以内に正解", "2人同時に正解", "連続3回成功"];

let players = [], spectators = [], scores = {}, currentPlayerIndex = 0;
let totalRounds = 3, currentRound = 1, isTeamMode = false;
let teams = { A: [], B: [] };
let timer, timeLeft = 20;

function goToStep(n) {
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById(`step${n}`)?.classList.remove("hidden");
}

function addPlayer() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="プレイヤー名" />`;
  document.getElementById("players").appendChild(div);
}

function addSpectator() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="観客名" />`;
  document.getElementById("spectators").appendChild(div);
}

function startGame() {
  const playerInputs = document.querySelectorAll("#players input");
  const spectatorInputs = document.querySelectorAll("#spectators input");
  players = Array.from(playerInputs).map(i => i.value.trim()).filter(v => v);
  spectators = Array.from(spectatorInputs).map(i => i.value.trim()).filter(v => v);
  if (players.length < 2) return alert("プレイヤーは2人以上必要です");

  scores = {};
  players.forEach(p => scores[p] = 0);
  currentPlayerIndex = 0;
  currentRound = 1;
  totalRounds = parseInt(document.getElementById("rounds").value) || 3;

  const method = document.getElementById("teamMethod").value;
  isTeamMode = method !== "solo";
  if (method === "random") {
    teams.A = [], teams.B = [];
    players.forEach((p, i) => (i % 2 === 0 ? teams.A : teams.B).push(p));
  } else if (method === "manual") {
    const mid = Math.ceil(players.length / 2);
    teams.A = players.slice(0, mid);
    teams.B = players.slice(mid);
  }

  const bgm = document.getElementById("bgm");
  const choice = document.getElementById("bgmSelect").value;
  const srcMap = {
    cafe: "/audio/bgm_cafe.mp3",
    anime: "/audio/bgm_anime.mp3",
    party: "/audio/bgm_party.mp3"
  };
  if (choice !== "none" && srcMap[choice]) {
    bgm.src = srcMap[choice];
    bgm.play();
  }

  goToStep("gameArea");
  showTopic();
}

function showTopic() {
  const category = document.getElementById("category").value;
  const topicList = topics[category];
  const topic = topicList[Math.floor(Math.random() * topicList.length)];
  document.getElementById("topicDisplay").textContent = topic;

  const bonus = Math.random() < 0.3 ? bonusRounds[Math.floor(Math.random() * bonusRounds.length)] : "";
  const mission = missions[Math.floor(Math.random() * missions.length)];
  document.getElementById("bonusDisplay").textContent = bonus ? `🎭 ボーナス: ${bonus}` : "";
  document.getElementById("missionDisplay").textContent = `🧩 ミッション: ${mission}`;

  updatePlayerInfo();
  startTimer();
  showScoreInputs();
}

function updatePlayerInfo() {
  const current = players[currentPlayerIndex];
  const next = players[(currentPlayerIndex + 1) % players.length];
  document.getElementById("currentPlayerDisplay").textContent = `現在のプレイヤー: ${current}`;
  document.getElementById("nextPlayerDisplay").textContent = `次のプレイヤー: ${next}`;
  document.getElementById("currentTeamDisplay").textContent = isTeamMode ? (teams.A.includes(current) ? "チームA" : "チームB") : "-";
}

function startTimer() {
  timeLeft = 20;
  document.getElementById("timer").textContent = `残り：${timeLeft} 秒`;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `残り：${timeLeft} 秒`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("timer").textContent = "時間終了！";
    }
  }, 1000);
}

function showScoreInputs() {
  const area = document.getElementById("scoreInput");
  area.innerHTML = "";
  const currentPlayer = players[currentPlayerIndex];
  let scoringTargets = isTeamMode ? (teams.A.includes(currentPlayer) ? teams.A : teams.B) : [currentPlayer];
  scoringTargets = scoringTargets.filter(p => !spectators.includes(p));
  scoringTargets.forEach(p => {
    area.innerHTML += `
      <label>${p} の結果：</label>
      <select id="result_${p}">
        <option value="fail">❌ 失敗</option>
        <option value="success">✅ 成功</option>
        <option value="great">🌟 大成功</option>
      </select><br>
    `;
  });
}

function submitScore() {
  const currentPlayer = players[currentPlayerIndex];
  const scoringTargets = isTeamMode ? (teams.A.includes(currentPlayer) ? teams.A : teams.B) : [currentPlayer];
  scoringTargets.forEach(p => {
    if (spectators.includes(p)) return;
    const result = document.getElementById(`result_${p}`).value;
    let base = result === "fail" ? 0 : result === "success" ? 5 : 7;
    let bonus = Math.min(Math.round(timeLeft * 0.2), 6);
    if (timeLeft >= 15) bonus += 3;
    scores[p] += base + bonus;
  });

  currentPlayerIndex++;
  if (currentPlayerIndex >= players.length) {
    showResult();
  } else {
    showTopic();
  }
}

function showResult() {
  goToStep("result");
  const ul = document.getElementById("scoreList");
  ul.innerHTML = "";
  let max = -1, mvp = "";
  players.forEach(p => {
    const score = scores[p];
    ul.innerHTML += `<li>${p}: ${score} 点</li>`;
    if (score > max) {
      max = score;
      mvp = p;
    }
  });
  document.getElementById("mvp").textContent = `👑 MVP: ${mvp} さん おめでとう！`;
  updateShareLinks();
}

function saveResultImage() {
  html2canvas(document.querySelector("#result")).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "result.png";
    a.click();
  });
}

function updateShareLinks() {
  const title = "App01 ジェスチャーゲーム";
  const text = "このアプリで遊んでみよう！";
  const url = encodeURIComponent(location.href);
  document.getElementById("shareX").href = `https://twitter.com/share?url=${url}&text=${title} - ${text}`;
  document.getElementById("shareLINE").href = `https://social-plugins.line.me/lineit/share?url=${url}`;
}

window.onload = () => {
  addPlayer();
  addPlayer();
  addSpectator();
  goToStep(0);
  updateShareLinks();
};
