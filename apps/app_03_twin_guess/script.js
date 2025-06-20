const questions = [
  {
    question: "好きな食べ物は？",
    twinTopic: "ラーメン", othersTopic: "うどん"
  },
  {
    question: "理想の休日は？",
    twinTopic: "映画館", othersTopic: "家でゴロゴロ"
  },
  {
    question: "子どもの頃の夢は？",
    twinTopic: "宇宙飛行士", othersTopic: "消防士"
  }
];

let players = [];
let twins = [];
let answers = [];
let currentPlayer = 0;
let currentQuestion = 0;

const main = document.getElementById("main");

// グローバルスコープに登録
window.registerPlayers = function() {
  const lines = document.getElementById("names").value.trim().split("\n").map(x => x.trim()).filter(x => x);
  if (lines.length < 5) {
    alert("5人以上必要です！");
    return;
  }
  players = lines.map(name => ({ name }));
  twins = pickRandomTwins(players.length);
  answers = Array(players.length).fill(null).map(() => []);
  currentPlayer = 0;
  currentQuestion = 0;
  showNextAnswerInput();
};

function pickRandomTwins(n) {
  const shuffled = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function showPlayerForm() {
  main.innerHTML = `
    <h2>プレイヤー登録（5人以上）</h2>
    <textarea id="names" rows="6" placeholder="名前を改行で入力してください（例：たかし\\nゆうこ\\n…）"></textarea>
    <button onclick="registerPlayers()">登録する</button>
  `;
}

function showNextAnswerInput() {
  if (currentQuestion >= questions.length) {
    showAllAnswers();
    return;
  }
  if (currentPlayer >= players.length) {
    currentPlayer = 0;
    currentQuestion++;
    showNextAnswerInput();
    return;
  }

  const p = players[currentPlayer];
  const isTwin = twins.includes(currentPlayer);
  const otherTwinIndex = twins.find(i => i !== currentPlayer);
  const topic = isTwin ? questions[currentQuestion].twinTopic : questions[currentQuestion].othersTopic;

  main.innerHTML = `
    <h2>${p.name}さんの回答</h2>
    <p>あなたのお題：<strong>${topic}</strong></p>
    ${isTwin ? `<p>※もう1人の双子：<strong>${players[otherTwinIndex].name}</strong></p>` : ""}
    <p>質問：${questions[currentQuestion].question}</p>
    <input type="text" id="answerInput" placeholder="ここに回答を入力" />
    <button onclick="submitAnswer()">送信</button>
  `;
}

window.submitAnswer = function() {
  const input = document.getElementById("answerInput").value.trim();
  if (!input) {
    alert("回答を入力してください！");
    return;
  }
  answers[currentPlayer][currentQuestion] = input;
  currentPlayer++;
  showNextAnswerInput();
};

function showAllAnswers() {
  main.innerHTML = "<h2>全員の回答</h2>";
  players.forEach((p, i) => {
    main.innerHTML += `<div><strong>${p.name}</strong><ul>` +
      answers[i].map(a => `<li>${a}</li>`).join("") +
      "</ul></div>";
  });
  main.innerHTML += `<button onclick="showTwinGuessPhase()">双子を当てる</button>`;
}

window.showTwinGuessPhase = function() {
  main.innerHTML = `
    <h2>推理タイム！</h2>
    <p>誰が双子だったかを選んでください（2人）</p>
    <select id="guess1"><option value="">--選択--</option>${players.map((p, i) => `<option value="${i}">${p.name}</option>`)}</select>
    <select id="guess2"><option value="">--選択--</option>${players.map((p, i) => `<option value="${i}">${p.name}</option>`)}</select>
    <button onclick="checkTwinGuess()">結果を見る</button>
  `;
};

window.checkTwinGuess = function() {
  const g1 = parseInt(document.getElementById("guess1").value);
  const g2 = parseInt(document.getElementById("guess2").value);
  if (isNaN(g1) || isNaN(g2) || g1 === g2) {
    alert("異なる2人を選んでください！");
    return;
  }

  const selected = [g1, g2].sort((a, b) => a - b).join(",");
  const correct = [...twins].sort((a, b) => a - b).join(",");
  const result = selected === correct
    ? "🎉 正解！一般人チームの勝ち！"
    : "😈 不正解…双子チームの勝ち！";

  main.innerHTML = `
    <h2>ゲーム終了！</h2>
    <p>選んだ双子：${players[g1].name} & ${players[g2].name}</p>
    <p>本当の双子：${players[twins[0]].name} & ${players[twins[1]].name}</p>
    <h2>${result}</h2>
    <button onclick="showPlayerForm()">もう一度遊ぶ</button>
  `;
};

showPlayerForm();
