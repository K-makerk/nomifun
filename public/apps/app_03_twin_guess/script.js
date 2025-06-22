const questions = [
  { question: "好きな食べ物は？", twinTopic: "ラーメン", othersTopic: "うどん" },
  { question: "理想の休日は？", twinTopic: "映画館", othersTopic: "家でゴロゴロ" },
  { question: "子どもの頃の夢は？", twinTopic: "宇宙飛行士", othersTopic: "消防士" }
];

let players = [];
let twins = [];
let answers = [];
let currentPlayer = 0;

let timerInterval = null;
let remainingSeconds = 0;

document.addEventListener("DOMContentLoaded", () => {
  showPlayerForm();
});

function showPlayerForm() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <h2>プレイヤー登録（5人以上）</h2>
    <textarea id="names" rows="6" placeholder="名前を改行で入力してください（例：たかし\\nゆうこ\\n…）"></textarea>
    <button id="registerBtn">登録する</button>
  `;
  document.getElementById("registerBtn").onclick = registerPlayers;
}

function registerPlayers() {
  const lines = document.getElementById("names").value.trim().split("\n").map(x => x.trim()).filter(x => x);
  if (lines.length < 5) {
    alert("5人以上必要です！");
    return;
  }
  players = lines.map(name => ({ name }));
  twins = pickRandomTwins(players.length);
  answers = Array(players.length).fill(null).map(() => []);
  currentPlayer = 0;
  showNextAnswerInput();
}

function pickRandomTwins(n) {
  const shuffled = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function showNextAnswerInput() {
  const main = document.getElementById("main");
  if (currentPlayer >= players.length) {
    showAllAnswers();
    return;
  }

  const p = players[currentPlayer];
  const isTwin = twins.includes(currentPlayer);
  const otherTwinIndex = twins.find(i => i !== currentPlayer);

  main.innerHTML = `
    <h2>${p.name}さんのターン</h2>
    ${isTwin ? `<p style="color: red; font-weight: bold;">あなたは双子です！<br>もう1人の双子：<strong>${players[otherTwinIndex].name}</strong></p>` : ""}
    <form id="answerForm">
      ${questions.map((q, i) => {
        const topic = isTwin ? q.twinTopic : q.othersTopic;
        return `
          <p><strong>質問${i + 1}:</strong> ${q.question}</p>
          <p>お題（あなたへの背景）: <strong>${topic}</strong></p>
          <input type="text" id="q_${i}" autocomplete="off" placeholder="この質問への回答を入力" required />
        `;
      }).join("")}
      <button type="submit">送信</button>
    </form>
  `;

  document.getElementById("answerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const playerAnswers = [];
    for (let i = 0; i < questions.length; i++) {
      const val = document.getElementById(`q_${i}`).value.trim();
      if (!val) {
        alert(`質問${i + 1}の回答が空白です！`);
        return;
      }
      playerAnswers.push(val);
    }
    answers[currentPlayer] = playerAnswers;
    currentPlayer++;
    showNextAnswerInput();
  });
}

function showAllAnswers() {
  const main = document.getElementById("main");
  main.innerHTML = "<h2>全員の回答</h2>";
  players.forEach((p, i) => {
    main.innerHTML += `<div class="card"><strong>${p.name}</strong><ul>` +
      answers[i].map(a => `<li>${a}</li>`).join("") +
      "</ul></div>";
  });

  main.innerHTML += `
    <div class="timer-control">
      <label>制限時間（分）: <input type="number" id="timeInput" value="3" min="1" /></label><br>
      <button onclick="startGameTimer()">開始</button>
      <button onclick="stopGameTimer()">終了</button>
      <div id="timerDisplay" class="timer-display"></div>
    </div>
    <button onclick="showTwinGuessPhase()">双子を当てる</button>
  `;
}

function startGameTimer() {
  const inputMinutes = parseInt(document.getElementById("timeInput").value);
  if (isNaN(inputMinutes) || inputMinutes <= 0) {
    alert("1分以上の値を入力してください。");
    return;
  }

  clearInterval(timerInterval);
  remainingSeconds = inputMinutes * 60;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      document.getElementById("timerDisplay").textContent = "⏰ 時間切れ！";
    }
  }, 1000);
}

function stopGameTimer() {
  clearInterval(timerInterval);
  document.getElementById("timerDisplay").textContent = "🛑 タイマー終了";
}

function updateTimerDisplay() {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  document.getElementById("timerDisplay").textContent = `残り時間: ${mins}分 ${secs}秒`;
}

function showTwinGuessPhase() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <h2>推理タイム！</h2>
    <p>誰が双子だったかを選んでください（2人）</p>
    <select id="guess1"><option value="">--選択--</option>${players.map((p, i) => `<option value="${i}">${p.name}</option>`)}</select>
    <select id="guess2"><option value="">--選択--</option>${players.map((p, i) => `<option value="${i}">${p.name}</option>`)}</select>
    <button onclick="checkTwinGuess()">結果を見る</button>
  `;
}

function checkTwinGuess() {
  const g1 = parseInt(document.getElementById("guess1").value);
  const g2 = parseInt(document.getElementById("guess2").value);
  if (isNaN(g1) || isNaN(g2) || g1 === g2) {
    alert("異なる2人を選んでください！");
    return;
  }

  const selected = [g1, g2].sort().join(",");
  const correct = [...twins].sort().join(",");
  const result = selected === correct
    ? "🎉 正解！一般人チームの勝ち！"
    : "😈 不正解…双子チームの勝ち！";

  const main = document.getElementById("main");
  main.innerHTML = `
    <h2>ゲーム終了！</h2>
    <p>選んだ双子：${players[g1].name} & ${players[g2].name}</p>
    <p>本当の双子：${players[twins[0]].name} & ${players[twins[1]].name}</p>
    <h2>${result}</h2>
    <button onclick="showPlayerForm()">もう一度遊ぶ</button>
  `;
}
