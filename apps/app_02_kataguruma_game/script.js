const prompts = [
  {
    question: "好きな季節は？",
    choices: ["春", "夏", "秋", "冬"]
  },
  {
    question: "朝ごはんといえば？",
    choices: ["ごはん", "パン", "シリアル", "食べない"]
  },
  {
    question: "好きな色は？",
    choices: ["赤", "青", "緑", "黒"]
  },
  {
    question: "休日の過ごし方は？",
    choices: ["寝る", "出かける", "ゲーム", "家事"]
  },
  {
    question: "好きな動物は？",
    choices: ["犬", "猫", "うさぎ", "パンダ"]
  },
  {
    question: "憧れの旅行先は？",
    choices: ["パリ", "ハワイ", "北海道", "沖縄"]
  }
];

let round = 1;
const totalRounds = 3;
let usedPrompts = [];
let currentPrompt = {};
let pairs = [];
let scores = [];
let answers = [];
let logs = [];
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
  logs = new Array(pairCount).fill(null).map(() => []);

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
  let available = prompts.filter(p => !usedPrompts.includes(p.question));
  currentPrompt = available[Math.floor(Math.random() * available.length)];
  usedPrompts.push(currentPrompt.question);

  document.getElementById('prompt').textContent = `お題：「${currentPrompt.question}」`;
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
    <h3>${name} の回答</h3>
    <div class="select-area">
      ${currentPrompt.choices.map(choice => `
        <label>
          <input type="radio" name="choice" value="${choice}"> ${choice}
        </label>
      `).join("")}
    </div>
    <button onclick="submitSingleAnswer()">完了</button>
  `;
}

function submitSingleAnswer() {
  const selected = document.querySelector('input[name="choice"]:checked');
  if (!selected) {
    alert("選択肢を選んでください");
    return;
  }

  const role = currentMemberIndex === 0 ? "upper" : "lower";
  answers[currentPairIndex][role] = selected.value;

  if (currentMemberIndex === 0) {
    currentMemberIndex = 1;
    showInput();
  } else {
    currentMemberIndex = 0;
    currentPairIndex++;
    if (currentPairIndex < pairs.length) {
      showInput();
    } else {
      evaluateRound();
    }
  }
}

function evaluateRound() {
  for (let i = 0; i < pairs.length; i++) {
    const { upper, lower } = answers[i];
    logs[i].push({
      question: currentPrompt.question,
      upper,
      lower,
      match: upper === lower
    });
    if (upper === lower) {
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

  const logArea = document.getElementById('answerLog');
  logArea.innerHTML = "";
  logs.forEach((log, i) => {
    logArea.innerHTML += `<h4>ペア${i + 1}：${pairs[i].upper} & ${pairs[i].lower}</h4><ul>`;
    log.forEach((entry, r) => {
      logArea.innerHTML += `
        <li>
          <strong>Q${r + 1}：${entry.question}</strong><br>
          ${pairs[i].upper}：${entry.upper}<br>
          ${pairs[i].lower}：${entry.lower}<br>
          一致：${entry.match ? "〇" : "×"}
        </li>
      `;
    });
    logArea.innerHTML += `</ul>`;
  });
}
