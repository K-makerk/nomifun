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

function changeBGM() {
  const bgm = document.getElementById("bgm");
  const choice = document.getElementById("bgmSelect").value;
  const srcMap = {
    cafe: "https://example.com/cafe.mp3",
    anime: "https://example.com/anime.mp3",
    party: "https://example.com/party.mp3"
  };
  if (choice === "none") {
    bgm.pause();
  } else {
    bgm.src = srcMap[choice];
    bgm.play();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showPlayerForm();
});

function showPlayerForm() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <h2>プレイヤー登録（5人以上）</h2>
    <div id="playerInputs">
      ${Array.from({ length: 5 }, () => '<div><input type="text" placeholder="プレイヤー名" /></div>').join("\n")}
    </div>
    <button onclick="addPlayerInput()">プレイヤー追加</button>
    <button onclick="removePlayerInput()">プレイヤー削除</button>
    <button onclick="confirmPlayers()">登録する</button>
  `;
}

function addPlayerInput() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="プレイヤー名" />`;
  document.getElementById("playerInputs").appendChild(div);
}

function removePlayerInput() {
  const container = document.getElementById("playerInputs");
  if (container.children.length > 5) {
    container.removeChild(container.lastElementChild);
  } else {
    alert("最低5人必要です");
  }
}

function confirmPlayers() {
  const inputs = document.querySelectorAll("#playerInputs input");
  players = [];
  inputs.forEach(input => {
    if (input.value.trim()) players.push({ name: input.value.trim() });
  });
  if (players.length < 5) return alert("5人以上必要です");

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
    ${isTwin ? `<p style="color: red;"><strong>あなたは双子です！<br>もう1人の双子：${players[otherTwinIndex].name}</strong></p>` : ""}
    <form id="answerForm">
      ${questions.map((q, i) => {
        const topic = isTwin ? q.twinTopic : q.othersTopic;
        return `
          <p><strong>質問${i + 1}:</strong> ${q.question}</p>
          <p>お題: <strong>${topic}</strong></p>
          <input type="text" id="q_${i}" required placeholder="回答を入力" />
        `;
      }).join("")}
      <button type="submit">送信</button>
    </form>
  `;
  document.getElementById("answerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const a = [];
    for (let i = 0; i < questions.length; i++) {
      const v = document.getElementById(`q_${i}`).value.trim();
      if (!v) return alert("すべての質問に回答してください");
      a.push(v);
    }
    answers[currentPlayer] = a;
    currentPlayer++;
    showNextAnswerInput();
  });
}

function showAllAnswers() {
  const main = document.getElementById("main");
  main.innerHTML = "<h2>全員の回答</h2>";
  players.forEach((p, i) => {
    main.innerHTML += `<div class="card"><strong>${p.name}</strong><ul>${answers[i].map(a => `<li>${a}</li>`).join("")}</ul></div>`;
  });

  main.innerHTML += `
    <div class="timer-control">
      <label>制限時間（分）:<input type="number" id="timeInput" value="3" min="1" /></label><br>
      <button onclick="startGameTimer()">開始</button>
      <button onclick="stopGameTimer()">終了</button>
      <div id="timerDisplay" class="timer-display"></div>
    </div>
    <button onclick="showTwinGuessPhase()">双子を当てる</button>
    <button onclick="saveResultImage()">🖼️ 画像保存</button>
  `;
}

function startGameTimer() {
  const inputMinutes = parseInt(document.getElementById("timeInput").value);
  if (isNaN(inputMinutes) || inputMinutes <= 0) return alert("正しい分数を入力してください");
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
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  document.getElementById("timerDisplay").textContent = `残り時間: ${m}分 ${s}秒`;
}

function showTwinGuessPhase() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <h2>誰が双子か推理しよう！</h2>
    <select id="guess1"><option value="">--選択--</option>${players.map((p, i) => `<option value="${i}">${p.name}</option>`)}</select>
    <select id="guess2"><option value="">--選択--</option>${players.map((p, i) => `<option value="${i}">${p.name}</option>`)}</select>
    <button onclick="checkTwinGuess()">結果を見る</button>
  `;
}

function checkTwinGuess() {
  const g1 = parseInt(document.getElementById("guess1").value);
  const g2 = parseInt(document.getElementById("guess2").value);
  if (isNaN(g1) || isNaN(g2) || g1 === g2) return alert("異なる2人を選んでください");
  const selected = [g1, g2].sort().join(",");
  const correct = twins.sort().join(",");
  const main = document.getElementById("main");
  main.innerHTML = `
    <h2>結果発表！</h2>
    <p>選んだ双子：${players[g1].name} & ${players[g2].name}</p>
    <p>本当の双子：${players[twins[0]].name} & ${players[twins[1]].name}</p>
    <h2>${selected === correct ? "🎉 正解！" : "😈 不正解…"}</h2>
    <button onclick="showPlayerForm()">もう一度遊ぶ</button>
  `;
}

function saveResultImage() {
  html2canvas(document.querySelector("main")).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "twin_game_result.png";
    a.click();
  });
}
