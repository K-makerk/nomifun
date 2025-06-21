let players = [];
let currentPlayerIndex = 0;
let votes = {};
let votedBy = {};
let playHistory = [];
let selectedCategory = "animal";
let challengeOn = true;
let timerInterval;
let timerSeconds = 30;

const topics = {
  animal: ["犬", "猫", "ライオン", "鳥", "馬"],
  celebrity: ["ビートたけし", "明石家さんま", "タモリ", "松本人志"],
  anime: ["ドラえもん", "悟空", "ルフィ", "ピカチュウ"],
  free: ["酔っぱらい", "赤ちゃん", "忍者", "ゾンビ", "アイドル"]
};

const challenges = ["片手だけで", "声だけで", "ジェスチャーのみで", "動き禁止で", "英語で"];

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

  selectedCategory = document.getElementById("categorySelect").value;
  challengeOn = document.getElementById("challengeSelect").value === "on";
  shuffle(topics[selectedCategory]);
  shuffle(challenges);
  currentPlayerIndex = 0;
  document.getElementById("setupScreen").classList.add("hidden");
  document.getElementById("mimicScreen").classList.remove("hidden");
  showMimic();
}

function showMimic() {
  document.getElementById("currentPlayerName").textContent = `${players[currentPlayerIndex]}さんの番です！`;
  const topic = topics[selectedCategory][currentPlayerIndex % topics[selectedCategory].length];
  const challenge = challengeOn ? challenges[currentPlayerIndex % challenges.length] : "なし";
  document.getElementById("mimicTopic").textContent = topic;
  document.getElementById("challengeText").textContent = challenge;
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerSeconds = 30;
  document.getElementById("timer").textContent = timerSeconds;
  timerInterval = setInterval(() => {
    timerSeconds--;
    document.getElementById("timer").textContent = timerSeconds;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function nextPlayer() {
  clearInterval(timerInterval);
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
  const section = document.getElementById("voteSection");
  section.innerHTML = "";

  players.forEach(voter => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${voter}さんの投票：</strong>`;
    players.forEach(candidate => {
      if (candidate !== voter) {
        const btn = document.createElement("button");
        btn.textContent = candidate;
        btn.onclick = () => {
          if (!votedBy[voter]) {
            votedBy[voter] = true;
            votes[candidate] = (votes[candidate] || 0) + 1;
            btn.disabled = true;
            div.innerHTML += `<span> → ${candidate}に投票済み</span>`;
            checkAllVoted();
          }
        };
        div.appendChild(btn);
      }
    });
    section.appendChild(div);
  });
}

function checkAllVoted() {
  if (Object.keys(votedBy).length >= players.length) {
    showResult();
  }
}

function showResult() {
  document.getElementById("voteScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.remove("hidden");

  const maxVotes = Math.max(...Object.values(votes));
  const winners = Object.keys(votes).filter(name => votes[name] === maxVotes);
  const winnerText = winners.length === 1
    ? `${winners[0]}さんが勝者です！`
    : `${winners.join("さん、")} が同票で勝者です！`;
  document.getElementById("winnerText").textContent = winnerText;

  // プレイ履歴に保存
  const topic = topics[selectedCategory][(players.length - 1) % topics[selectedCategory].length];
  const challenge = challengeOn ? challenges[(players.length - 1) % challenges.length] : "なし";
  const historyItem = `${topic}（縛り: ${challenge}）→ 勝者: ${winners.join("／")}`;
  playHistory.push(historyItem);

  const log = document.getElementById("historyLog");
  log.innerHTML = "";
  playHistory.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    log.appendChild(li);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
