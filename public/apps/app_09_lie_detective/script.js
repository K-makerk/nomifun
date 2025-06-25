let players = [];
let liarIndex = -1;
let currentAnswerIndex = 0;
let answers = {};
let votes = {};
let question = "";

function addPlayerInput() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="プレイヤー名" class="playerName" />`;
  document.getElementById("playerInputs").appendChild(div);
}

function startGame() {
  const inputs = document.querySelectorAll(".playerName");
  players = [];
  inputs.forEach(input => {
    const name = input.value.trim();
    if (name) players.push(name);
  });
  if (players.length < 4) {
    alert("4人以上のプレイヤーが必要です");
    return;
  }
  liarIndex = Math.floor(Math.random() * players.length);
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("questionSection").classList.remove("hidden");
}

function submitQuestion() {
  const q = document.getElementById("questionInput").value.trim();
  if (!q) {
    alert("質問を入力してください");
    return;
  }
  question = q;
  document.getElementById("questionSection").classList.add("hidden");
  document.getElementById("answerSection").classList.remove("hidden");
  showNextAnswerInput();
}

function showNextAnswerInput() {
  if (currentAnswerIndex >= players.length) {
    document.getElementById("answerSection").classList.add("hidden");
    showVoting();
    return;
  }
  document.getElementById("answerInput").value = "";
  document.getElementById("currentAnswerPlayer").innerText = `${players[currentAnswerIndex]} の番です`;
}

function submitAnswer() {
  const answer = document.getElementById("answerInput").value.trim();
  if (!answer) {
    alert("回答を入力してください");
    return;
  }
  const name = players[currentAnswerIndex];
  if (currentAnswerIndex === liarIndex) {
    answers[name] = "（嘘）" + answer;
  } else {
    answers[name] = answer;
  }
  currentAnswerIndex++;
  showNextAnswerInput();
}

function showVoting() {
  document.getElementById("voteSection").classList.remove("hidden");
  const voteArea = document.getElementById("voteButtons");
  voteArea.innerHTML = "";
  players.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = `${name}: ${answers[name]}`;
    btn.onclick = () => castVote(name);
    voteArea.appendChild(btn);
  });
}

function castVote(name) {
  votes[name] = (votes[name] || 0) + 1;
  if (Object.values(votes).reduce((a, b) => a + b, 0) >= players.length) {
    showResult();
  } else {
    alert("投票を記録しました。次の人に交代してください。");
  }
}

function showResult() {
  document.getElementById("voteSection").classList.add("hidden");
  document.getElementById("resultSection").classList.remove("hidden");

  let maxVote = 0;
  let topCandidates = [];
  for (let [name, count] of Object.entries(votes)) {
    if (count > maxVote) {
      maxVote = count;
      topCandidates = [name];
    } else if (count === maxVote) {
      topCandidates.push(name);
    }
  }

  const liarName = players[liarIndex];
  const result = document.getElementById("voteResult");
  const correct = document.getElementById("correctAnswer");

  result.innerHTML = `<p>最多票: ${topCandidates.join(", ")}</p>`;
  correct.innerHTML = `<p>嘘つきは: <strong>${liarName}</strong></p>`;

  if (topCandidates.includes(liarName)) {
    correct.innerHTML += `<p>🎉 探偵陣の勝ち！</p>`;
  } else {
    correct.innerHTML += `<p>😈 嘘つきの勝ち！</p>`;
  }
}

// BGM切り替え
function toggleBGM() {
  const bgm = document.getElementById("bgm");
  if (bgm.paused) {
    bgm.play();
  } else {
    bgm.pause();
  }
}

// 結果画面保存
function saveScreenshot() {
  html2canvas(document.body).then(canvas => {
    const link = document.createElement("a");
    link.download = "result.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
