const prompts = [
  "好きな季節は？", "朝ごはんといえば？", "好きな色は？", "休日の過ごし方は？",
  "好きな動物は？", "憧れの旅行先は？", "子供の頃の夢は？", "テンションが上がる食べ物は？"
];

let round = 1;
const totalRounds = 3;
let currentPrompt = "";
let pairs = [];
let scores = [];
let answers = [];
let currentPairIndex = 0;
let currentMemberIndex = 0;

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
        <label>ペア${i + 1}（上 / 下）</label><br>
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
  scores = new Array(pairCount).fill(0);

  for (let i = 0; i < pairCount; i++) {
    const upper = document.getElementById(`upper${i}`).value.trim();
    const lower = document.getElementById(`lower${i}`).value.trim();
    if (!upper || !lower) {
      alert("すべての名前を入力してください");
      return;
    }
    pairs.push({ upper, lower });
  }

  document.getElementById('pairInputs').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  loadRound();
}

function loadRound() {
  currentPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  document.getElementById('prompt').textContent = `お題：「${currentPrompt}」`;
  document.getElementById('roundNumber').textContent = round;
  answers = new Array(pairs.length).fill(null).map(() => ({ upper: "", lower: "" }));
  currentPairIndex = 0;
  currentMemberIndex = 0;
  showInput();
}

function showInput() {
  const pair = pairs[currentPairIndex];
  const role = currentMemberIndex === 0 ? "upper" : "lower";
  const name = pair[role];
  const inputArea = document.getElementById('inputArea');

  inputArea.innerHTML = `
    <h3>${name} の入力</h3>
    <input type="text" id="answerInput" placeholder="回答を入力">
    <button onclick="submitSingleAnswer()">完了</button>
  `;
}

function submitSingleAnswer() {
  const input = document.getElementById('answerInput').value.trim();
  if (!input) {
    alert("回答を入力してください");
    return;
  }

  const role = currentMemberIndex === 0 ? "upper" : "lower";
  answers[currentPairIndex][role] = input;

  if (currentMemberIndex === 0) {
    currentMemberIndex = 1;
    showInput(); // 下の人へ
  } else {
    currentMemberIndex = 0;
    currentPairIndex++;
    if (currentPairIndex < pairs.length) {
      showInput(); // 次のペアへ
    } else {
      evaluateRound(); // ラウンド終了
    }
  }
}

function evaluateRound() {
  for (let i = 0; i < pairs.length; i++) {
    const { upper, lower } = answers[i];
    if (upper && lower && upper === lower) {
      scores[i]++;
    }
  }

  if (round < totalRounds) {
    round++;
    loadRound();
  } else {
    showResult();
  }
}

function showResult() {
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

  document.getElementById('winner').textContent =
    winners.length > 1
      ? `勝者（同点）：${winners.join(' / ')}`
      : `勝者：${winners[0]}`;
}
