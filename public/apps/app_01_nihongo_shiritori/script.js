const prompts = {
  animals: ["犬", "猫", "ゾウ", "カンガルー", "ライオン", "タコ", "カメ", "うさぎ"],
  jobs: ["医者", "教師", "警察官", "大工", "美容師", "農家", "DJ", "パイロット"],
  actions: ["ジャンプ", "寝る", "走る", "お辞儀", "ダンス", "泣く", "投げる", "食べる"],
  hard: ["ゴリラのプロポーズ", "サメの散歩", "ゾンビのカラオケ", "宇宙人の腹痛"]
};

let players = [];
let spectators = [];
let teams = { A: [], B: [] };
let currentPlayerIndex = 0;
let currentRound = 1;
let totalRounds = 3;
let gameStarted = false;
let timerInterval = null;

function addPlayer() {
  const name = prompt("プレイヤーの名前を入力:");
  if (name) {
    players.push({ name, score: 0 });
    updatePlayers();
  }
}

function addSpectator() {
  const name = prompt("観客の名前を入力:");
  if (name) {
    spectators.push(name);
    updateSpectators();
  }
}

function updatePlayers() {
  const div = document.getElementById("players");
  div.innerHTML = "<h3>プレイヤー:</h3><ul>" +
    players.map(p => `<li>${p.name}</li>`).join("") + "</ul>";
}

function updateSpectators() {
  const div = document.getElementById("spectators");
  div.innerHTML = "<h3>観客:</h3><ul>" +
    spectators.map(s => `<li>${s}</li>`).join("") + "</ul>";
}

function startGame() {
  const category = document.getElementById("category").value;
  const method = document.getElementById("teamMethod").value;
  const rounds = parseInt(document.getElementById("rounds").value);
  totalRounds = isNaN(rounds) ? 3 : rounds;

  if (players.length < 1) {
    alert("プレイヤーを1人以上追加してください");
    return;
  }

  assignTeams(method);
  currentPlayerIndex = 0;
  currentRound = 1;
  gameStarted = true;
  playBGM();

  goToStep("gameArea");
  nextTurn();
}

function assignTeams(method) {
  teams = { A: [], B: [] };
  if (method === "solo") return;
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  if (method === "random") {
    shuffled.forEach((p, i) => {
      if (i % 2 === 0) teams.A.push(p);
      else teams.B.push(p);
    });
  } else {
    let manual = prompt("プレイヤー名とチーム（A/B）をカンマ区切りで入力（例：太郎,A|花子,B）");
    if (manual) {
      manual.split("|").forEach(pair => {
        const [name, team] = pair.split(",");
        const player = players.find(p => p.name === name);
        if (player && team === "A") teams.A.push(player);
        if (player && team === "B") teams.B.push(player);
      });
    }
  }
}

function nextTurn() {
  const player = players[currentPlayerIndex];
  const category = document.getElementById("category").value;
  const topic = getRandomTopic(category);
  document.getElementById("currentPlayerDisplay").innerText = `🎭 今の演技者：${player.name}`;
  document.getElementById("nextPlayerDisplay").innerText = `▶ 次の人：${players[(currentPlayerIndex + 1) % players.length].name}`;
  document.getElementById("currentTeamDisplay").innerText = getTeamDisplay(player);
  document.getElementById("topicDisplay").innerText = topic;
  document.getElementById("bonusDisplay").innerText = Math.random() > 0.7 ? "🎯 ボーナスラウンド！成功で+3点！" : "";
  document.getElementById("missionDisplay").innerText = Math.random() > 0.6 ? "⏱ 5秒以内に正解で+2点！" : "";

  startTimer(10);
  showScoreInput(player);
}

function getTeamDisplay(player) {
  if (teams.A.includes(player)) return "チーム：A";
  if (teams.B.includes(player)) return "チーム：B";
  return "個人戦";
}

function getRandomTopic(category) {
  const list = prompts[category] || [];
  return list[Math.floor(Math.random() * list.length)];
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  let time = seconds;
  document.getElementById("timer").innerText = `残り：${time} 秒`;
  timerInterval = setInterval(() => {
    time--;
    document.getElementById("timer").innerText = `残り：${time} 秒`;
    if (time <= 0) {
      clearInterval(timerInterval);
      document.getElementById("timer").innerText = "⌛ タイムアップ！";
    }
  }, 1000);
}

function showScoreInput(player) {
  const container = document.getElementById("scoreInput");
  container.innerHTML = `
    <p>スコアを選んでください（観客用）</p>
    <label><input type="radio" name="score" value="1">失敗（1点）</label>
    <label><input type="radio" name="score" value="3">成功（3点）</label>
    <label><input type="radio" name="score" value="5">大成功（5点）</label>
  `;
}

function submitScore() {
  const score = document.querySelector('input[name="score"]:checked');
  if (!score) return alert("スコアを選んでください");

  const player = players[currentPlayerIndex];
  const value = parseInt(score.value);
  player.score += value;

  currentPlayerIndex++;
  if (currentPlayerIndex >= players.length) {
    currentPlayerIndex = 0;
    currentRound++;
  }

  if (currentRound > totalRounds) {
    showResult();
  } else {
    nextTurn();
  }
}

function showResult() {
  goToStep("result");
  const ul = document.getElementById("scoreList");
  ul.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.name}：${p.score} 点`;
    ul.appendChild(li);
  });

  const max = Math.max(...players.map(p => p.score));
  const top = players.find(p => p.score === max);
  document.getElementById("mvp").innerText = `🏆 MVP：${top.name}！`;
}

function playBGM() {
  const bgm = document.getElementById("bgm");
  const selected = document.getElementById("bgmSelect").value;
  const srcMap = {
    none: "",
    cafe: "/bgm/cafe.mp3",
    anime: "/bgm/anime.mp3",
    party: "/bgm/party.mp3"
  };
  bgm.src = srcMap[selected];
  if (selected !== "none") bgm.play();
}

function saveResultImage() {
  html2canvas(document.body).then(canvas => {
    const link = document.createElement("a");
    link.download = "result.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

function updateShareLinks() {
  const text = encodeURIComponent("ジェスチャーゲームで遊んだよ！");
  const url = encodeURIComponent(location.href);
  document.getElementById("shareX").href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  document.getElementById("shareLINE").href = `https://social-plugins.line.me/lineit/share?url=${url}`;
}
