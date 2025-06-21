let players = [];
let habits = [];
let currentHabitIndex = 0;
let shuffledHabits = [];
let votes = [];
let scores = {};
let habitMap = {}; // クセ→誰のクセか

function addPlayerInput() {
  const div = document.createElement("div");
  div.innerHTML = `<input placeholder="プレイヤー名"/>`;
  document.getElementById("playerInputs").appendChild(div);
}

function confirmPlayers() {
  const inputs = document.querySelectorAll("#playerInputs input");
  players = [];
  inputs.forEach(input => {
    if (input.value.trim()) players.push(input.value.trim());
  });

  if (players.length < 4) {
    alert("4人以上必要です！");
    return;
  }

  players.forEach(p => scores[p] = 0);
  document.getElementById("setup").classList.add("hidden");

  const habitDiv = document.getElementById("habitInputs");
  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<label>${p} のクセ：</label><input data-player="${p}" placeholder="例: 寝る前に絶対チョコを食べる"/>`;
    habitDiv.appendChild(div);
  });
  document.getElementById("habitEntry").classList.remove("hidden");
}

function submitHabits() {
  const inputs = document.querySelectorAll("#habitInputs input");
  habits = [];
  habitMap = {};
  inputs.forEach(input => {
    const text = input.value.trim();
    const owner = input.dataset.player;
    if (text === "") return;
    habits.push(text);
    habitMap[text] = owner;
  });

  if (habits.length !== players.length) {
    alert("全員がクセを入力してください！");
    return;
  }

  shuffledHabits = shuffle([...habits]);
  document.getElementById("habitEntry").classList.add("hidden");
  startNextGuess();
}

function startNextGuess() {
  if (currentHabitIndex >= shuffledHabits.length) {
    showFinalResult();
    return;
  }

  const habit = shuffledHabits[currentHabitIndex];
  document.getElementById("currentHabit").textContent = `"${habit}"`;
  document.getElementById("voteOptions").innerHTML = "";

  players.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = p;
    btn.classList.add("vote-btn");
    btn.onclick = () => {
      document.querySelectorAll(".vote-btn").forEach(b => b.disabled = true);
      btn.dataset.selected = "true";
    };
    document.getElementById("voteOptions").appendChild(btn);
  });

  document.getElementById("guessPhase").classList.remove("hidden");
}

function submitVote() {
  const selected = document.querySelector(".vote-btn[data-selected='true']");
  if (!selected) {
    alert("誰か1人に投票してください！");
    return;
  }

  const voted = selected.textContent;
  const actual = habitMap[shuffledHabits[currentHabitIndex]];
  if (voted === actual) {
    scores[voted]++;
  }

  document.getElementById("guessPhase").classList.add("hidden");
  document.getElementById("resultPhase").classList.remove("hidden");
  document.getElementById("revealAnswer").innerHTML = `正解は <strong>${actual}</strong> でした！`;
}

function nextRound() {
  currentHabitIndex++;
  document.getElementById("resultPhase").classList.add("hidden");
  startNextGuess();
}

function showFinalResult() {
  document.getElementById("scoreboard").innerHTML = "<h3>正解数ランキング</h3><ul>" +
    Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([name, score]) => `<li>${name}: ${score}回 正解</li>`).join("") +
    "</ul>";

  document.getElementById("revealAllHabits").innerHTML = "<h3>暴露リスト</h3><ul>" +
    habits.map(h => `<li>${h} → ${habitMap[h]}</li>`).join("") +
    "</ul>";

  document.getElementById("finalResult").classList.remove("hidden");
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
