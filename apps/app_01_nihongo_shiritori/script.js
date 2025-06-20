const topics = ["ゾウ", "ライオン", "バナナ", "ギター", "寝る", "ジャンプ", "ドラム", "水泳", "先生", "カンガルー"];
let players = [];
let teams = { A: [], B: [] };
let isTeamMode = false;
let totalRounds = 3;
let currentRound = 1;
let scores = {};
let currentPlayerIndex = 0;
let timer;
let timeLeft = 20;

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function setupGame() {
  const input = document.getElementById("playerInput").value;
  players = input.split(",").map(name => name.trim()).filter(name => name);
  const method = document.getElementById("teamMethod").value;
  totalRounds = parseInt(document.getElementById("gameCount").value);
  document.getElementById("totalRounds").textContent = totalRounds;

  if (players.length === 0) {
    alert("プレイヤーを入力してください");
    return;
  }

  if (method === "none") {
    isTeamMode = false;
  } else {
    isTeamMode = true;
    if (method === "random") {
      teams.A = [];
      teams.B = [];
      players.forEach((p, i) => {
        (i % 2 === 0 ? teams.A : teams.B).push(p);
      });
    } else if (method === "manual") {
      const mid = Math.ceil(players.length / 2);
      teams.A = players.slice(0, mid);
      teams.B = players.slice(mid);
    }
  }

  scores = {};
  players.forEach(p => scores[p] = 0);
  currentRound = 1;
  currentPlayerIndex = 0;

  document.getElementById("setupScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("scoreDisplay").style.display = "none";
  document.getElementById("roundNum").textContent = currentRound;

  updatePlayerDisplay();
}

function updatePlayerDisplay() {
  const current = players[currentPlayerIndex];
  const next = players[(currentPlayerIndex + 1) % players.length];
  const team = getTeamName(current);

  document.getElementById("currentPlayerDisplay").textContent = `現在のプレイヤー: ${current}`;
  document.getElementById("nextPlayerDisplay").textContent = `次のプレイヤー: ${next}`;
  document.getElementById("instructionText").textContent = `${current}さんは準備できたら「お題を表示」ボタンを押してください`;
  document.getElementById("currentTeamDisplay").textContent = isTeamMode ? `現在のチーム: チーム${team}` : "現在のチーム: -";

  speak(`${current}さん、準備ができたらスタートしてください`);
}

function getTeamName(name) {
  if (!isTeamMode) return "";
  if (teams.A.includes(name)) return "A";
  if (teams.B.includes(name)) return "B";
  return "";
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "ja-JP";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }
}

function startGame() {
  updatePlayerDisplay();
  const topic = topics[Math.floor(Math.random() * topics.length)];
  document.getElementById("topicArea").textContent = "お題: " + topic;
  timeLeft = 20;
  document.getElementById("timer").textContent = `残り時間: ${timeLeft}秒`;

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `残り時間: ${timeLeft}秒`;
    if (timeLeft <= 5) {
      document.getElementById("timer").style.color = "red";
    }
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("timer").textContent = "時間終了！";
      showScoreInputs();
    }
  }, 1000);
}

function resetGame() {
  clearInterval(timer);
  document.getElementById("topicArea").textContent = "ここにお題が表示されます";
  document.getElementById("timer").textContent = "残り時間: --秒";
  document.getElementById("scoreInputArea").innerHTML = "";
}

function showScoreInputs() {
  const area = document.getElementById("scoreInputArea");
  area.innerHTML = "";
  players.forEach(p => {
    area.innerHTML += `<label>${p}のスコア（1〜10）:</label> 
      <input type="number" id="score_${p}" min="1" max="10"><br>`;
  });
}

function submitScores() {
  players.forEach(p => {
    const val = parseInt(document.getElementById(`score_${p}`).value);
    if (!isNaN(val)) scores[p] += val;
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

function showScoreBoard() {
  const board = document.getElementById("scoreBoard");
  board.innerHTML = "";
  Object.entries(scores).forEach(([name, score]) => {
    board.innerHTML += `<li>${name}: ${score} 点</li>`;
  });

  document.getElementById("scoreDisplay").style.display = "block";
}

function share() {
  alert("SNSで共有されました（模擬）");
}
