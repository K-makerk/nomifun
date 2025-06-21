let players = [];
let currentPlayerIndex = 0;
let votes = {};
let topics = [
  "犬の鳴き声", "有名人のインタビュー", "ゾンビの歩き方", "赤ちゃんの泣き声",
  "忍者のポーズ", "アイドルの自己紹介", "サルの鳴き声", "アナウンサー風ニュース",
  "酔っぱらいの話し方", "ドラゴンの鳴き声"
];

function addPlayer() {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "プレイヤー名";
  document.getElementById("playerInputs").appendChild(input);
}

function removePlayer() {
  const container = document.getElementById("playerInputs");
  if (container.children.length > 3) {
    container.removeChild(container.lastElementChild);
  } else {
    alert("最低3人必要です");
  }
}

function startGame() {
  const inputs = document.querySelectorAll("#playerInputs input");
  players = [];
  inputs.forEach(input => {
    const name = input.value.trim();
    if (name) players.push(name);
  });

  if (players.length < 3) {
    alert("プレイヤーは3人以上必要です");
    return;
  }

  shuffle(topics);
  currentPlayerIndex = 0;
  document.getElementById("setupScreen").classList.add("hidden");
  document.getElementById("mimicScreen").classList.remove("hidden");
  showMimic();
}

function showMimic() {
  document.getElementById("currentPlayerName").textContent = `${players[currentPlayerIndex]}さんの番です！`;
  document.getElementById("mimicTopic").textContent = topics[currentPlayerIndex % topics.length];
}

function nextPlayer() {
  currentPlayerIndex++;
  if (currentPlayerIndex < players.length) {
    showMimic();
  } else {
    showVoteScreen();
  }
}

function showVoteScreen() {
  document.getElementById("mimicScreen").classList.add("hidden");
  document.getElementById("voteScreen").classList.remove("hidden");

  const voteButtons = document.getElementById("voteButtons");
  voteButtons.innerHTML = "";

  players.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => registerVote(name);
    voteButtons.appendChild(btn);
  });
}

function registerVote(name) {
  votes[name] = (votes[name] || 0) + 1;

  // 一人1票想定、全員投票後集計
  if (Object.values(votes).reduce((a, b) => a + b, 0) >= players.length) {
    showResult();
  }
}

function showResult() {
  document.getElementById("voteScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.remove("hidden");

  const maxVotes = Math.max(...Object.values(votes));
  const winners = Object.keys(votes).filter(name => votes[name] === maxVotes);
  document.getElementById("winnerText").textContent =
    winners.length === 1
      ? `${winners[0]}さんが勝者です！`
      : `${winners.join("さん、")} が同票で勝者です！`;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
