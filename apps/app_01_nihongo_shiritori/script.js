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
let currentCategory = "animals";
let teams = { A: [], B: [] };
let timer, timeLeft = 20;

function setupGame() {
  players = document.getElementById("playerInput").value.split(",").map(s => s.trim()).filter(Boolean);
  spectators = document.getElementById("spectatorInput").value.split(",").map(s => s.trim()).filter(Boolean);
  currentCategory = document.getElementById("topicCategory").value;
  totalRounds = parseInt(document.getElementById("gameCount").value);
  players.forEach(p => scores[p] = 0);
  currentRound = 1;
  currentPlayerIndex = 0;

  const method = document.getElementById("teamMethod").value;
  if (method === "random") {
    teams.A = [], teams.B = [];
    players.forEach((p, i) => (i % 2 === 0 ? teams.A : teams.B).push(p));
    isTeamMode = true;
  } else if (method === "manual") {
    const mid = Math.ceil(players.length / 2);
    teams.A = players.slice(0, mid);
    teams.B = players.slice(mid);
    isTeamMode = true;
  } else {
    isTeamMode = false;
  }

  const bgm = document.getElementById("bgm");
  const choice = document.getElementById("bgmSelect").value;
  if (choice === "cafe") bgm.src = "https://example.com/cafe.mp3";
  if (choice === "anime") bgm.src = "https://example.com/anime.mp3";
  if (choice === "party") bgm.src = "https://example.com/party.mp3";
  if (choice !== "none") bgm.play();

  document.getElementById("setupScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("totalRounds").textContent = totalRounds;
  updatePlayerDisplay();
}

function updatePlayerDisplay() {
  const current = players[currentPlayerIndex];
  const next = players[(currentPlayerIndex + 1) % players.length];
  document.getElementById("currentPlayerDisplay").textContent = `現在のプレイヤー: ${current}`;
  document.getElementById("nextPlayerDisplay").textContent = `次のプレイヤー: ${next}`;
  document.getElementById("instructionText").textContent = `${current}さんはお題を表示してください`;
  document.getElementById("currentTeamDisplay").textContent = isTeamMode ? (teams.A.includes(current) ? "チームA" : "チームB") : "-";
}

function startGame() {
  const topicList = topics[currentCategory];
  const topic = topicList[Math.floor(Math.random() * topicList.length)];
  document.getElementById("topicArea").textContent = "お題: " + topic;

  const isBonus = Math.random() < 0.3;
  document.getElementById("bonusText").textContent = isBonus ? "🎭 ボーナス: " + bonusRounds[Math.floor(Math.random() * bonusRounds.length)] : "";

  const mission = missions[Math.floor(Math.random() * missions.length)];
  document.getElementById("missionText").textContent = "🧩 チャレンジ: " + mission;

  timeLeft = 20;
  document.getElementById("timer").textContent = `残り時間: ${timeLeft}秒`;

  clearInterval(timer);
  showScoreInputs();
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `残り時間: ${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("timer").textContent = "時間終了！";
    }
  }, 1000);
}

function showScoreInputs() {
  const area = document.getElementById("scoreInputArea");
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

function submitScores() {
  const currentPlayer = players[currentPlayerIndex];
  const scoringTargets = isTeamMode ? (teams.A.includes(currentPlayer) ? teams.A : teams.B) : [currentPlayer];

  scoringTargets.forEach(p => {
    if (spectators.includes(p)) return;
    const result = document.getElementById(`result_${p}`).value;
    let base = result === "fail" ? 0 : result === "success" ? 5 : 7;
    let bonus = Math.min(Math.round(timeLeft * 0.2), 6);
    if (timeLeft >= (20 - 5)) bonus += 3;
    scores[p] += base + bonus;
  });

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  if (currentRound < totalRounds) {
    currentRound++;
    document.getElementById("roundNum").textContent = currentRound;
    resetGame();
    updatePlayerDisplay();
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
}

function showScoreBoard() {
  document.getElementById("gameArea").style.display = "none";
  const board = document.getElementById("scoreBoard");
  board.innerHTML = "";
  let max = -1, mvp = "";
  Object.entries(scores).forEach(([name, score]) => {
    board.innerHTML += `<li>${name}: ${score} 点</li>`;
    if (score > max) {
      max = score;
      mvp = name;
    }
  });
  document.getElementById("mvpDisplay").textContent = `👑 MVP: ${mvp} さん おめでとう！`;
  document.getElementById("scoreDisplay").style.display = "block";
}

function saveResultImage() {
  html2canvas(document.querySelector("#scoreDisplay")).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "result.png";
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
  document.getElementById("timer").textContent = "残り時間: --秒";
}

function forceEnd() {
  clearInterval(timer);
  document.getElementById("timer").textContent = "時間終了（手動）！";
}
