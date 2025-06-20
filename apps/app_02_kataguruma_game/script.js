const prompts = [
  "好きな季節は？", "朝ごはんといえば？", "好きな色は？", "休日の過ごし方は？",
  "好きな動物は？", "憧れの旅行先は？", "子供の頃の夢は？", "テンションが上がる食べ物は？"
];

let round = 1;
let totalRounds = 3;
let currentPrompt = "";
let pairs = [];
let scores = [];

function createPairInputs() {
  const count = parseInt(document.getElementById('playerCount').value);
  if (isNaN(count) || count < 2 || count % 2 !== 0) {
    alert("偶数の人数を入力してください");
    return;
  }

  const pairInputs = document.getElementById('pairInputs');
  pairInputs.innerHTML = `<h2>ペア入力</h2>`;
  for (let i = 0; i < count / 2; i++) {
    pairInputs.innerHTML += `
      <div>
        <label>ペア${i + 1}（上の人 / 下の人）</label><br>
        <input type="text" id="upper${i}" placeholder="上の人の名前">
        <input type="text" id="lower${i}" placeholder="下の人の名前">
      </div>
    `;
  }
  pairInputs.innerHTML += `<button onclick="startGame(${count / 2})">ゲーム開始</button>`;
  document.getElementById('setup').style.display = 'none';
  pairInputs.style.display = 'block';
}

function startGame(pairCount) {
  pairs = [];
  scores = [];

  for (let i = 0; i < pairCount; i++) {
    const upper = document.getElementById(`upper${i}`).value.trim();
    const lower = document.getElementById(`lower${i}`).value.trim();
    if (!upper || !lower) {
      alert("すべての名前を入力してください");
      return;
    }
    pairs.push({ upper, lower });
    scores.push(0);
  }

  document.getElementById('pairInputs').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  loadRound();
}

function loadRound() {
  currentPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  document.getElementById('prompt').textContent = `お題：「${currentPrompt}」`;
  document.getElementById('roundNumber').textContent = round;

  const answerDiv = document.getElementById('answers');
  answerDiv.innerHTML = "";
  pairs.forEach((pair, i) => {
    answerDiv.innerHTML += `
      <div>
        <strong>${pair.upper} の回答</strong>
        <input type="text" id="upperAnswer${i}">
        <strong>${pair.lower} の回答</strong>
        <input type="text" id="lowerAnswer${i}">
      </div>
    `;
  });
}

function submitAnswers() {
  pairs.forEach((pair, i) => {
    const upperAns = document.getElementById(`upperAnswer${i}`).value.trim();
    const lowerAns = document.getElementById(`lowerAnswer${i}`).value.trim();
    if (upperAns && lowerAns && upperAns === lowerAns) {
      scores[i]++;
    }
  });

  if (round < totalRounds) {
    round++;
    loadRound();
  } else {
    endGame();
  }
}

function endGame() {
  document.getElementById('game').style.display = 'none';
  document.getElementById('result').style.display = 'block';

  const scoreBoard = document.getElementById('scoreBoard');
  scoreBoard.innerHTML = "";
  let maxScore = Math.max(...scores);
  let winners = [];

  pairs.forEach((pair, i) => {
    scoreBoard.innerHTML += `<p>${pair.upper} & ${pair.lower}：${scores[i]} 回一致</p>`;
    if (scores[i] === maxScore) {
      winners.push(`${pair.upper} & ${pair.lower}`);
    }
  });

  const winnerText = winners.length > 1 ?
    `勝者（同点）：${winners.join(' / ')}` :
    `勝者：${winners[0]}`;

  document.getElementById('winner').textContent = winnerText;
}
