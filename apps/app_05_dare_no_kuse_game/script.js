let players = [];
let currentInputIndex = 0;
let habits = [];
let habitMap = {};
let gameMode = 1;
let revealedHabit = "";
let answerLogs = {};
let correctCount = {};
let shuffledHabits = [];
let currentHabitIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  for (let i = 0; i < 3; i++) addPlayerInput();
});

function addPlayerInput() {
  const div = document.createElement("div");
  div.className = "player-input";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "プレイヤー名";
  div.appendChild(input);
  document.getElementById("playerInputs").appendChild(div);
}

function removePlayerInput() {
  const container = document.getElementById("playerInputs");
  if (container.children.length > 3) {
    container.removeChild(container.lastElementChild);
  } else {
    alert("最低3人必要です");
  }
}

function confirmPlayers() {
  const inputs = document.querySelectorAll("#playerInputs input");
  players = [];
  inputs.forEach(input => {
    if (input.value.trim()) players.push(input.value.trim());
  });
  if (players.length < 3) return alert("3人以上必要です");

  gameMode = parseInt(document.querySelector("input[name='gameMode']:checked").value);
  document.getElementById("setup").classList.add("hidden");
  currentInputIndex = 0;
  habits = [];
  habitMap = {};
  answerLogs = {};
  document.getElementById("individualInputPhase").classList.remove("hidden");
  document.getElementById("currentPlayerName").textContent = players[currentInputIndex];
}

function submitIndividualHabit() {
  const input = document.getElementById("individualHabitInput").value.trim();
  if (!input) return alert("クセを入力してください");
  const player = players[currentInputIndex];
  habits.push(input);
  habitMap[input] = player;
  document.getElementById("individualHabitInput").value = "";
  currentInputIndex++;
  if (currentInputIndex < players.length) {
    document.getElementById("currentPlayerName").textContent = players[currentInputIndex];
  } else {
    document.getElementById("individualInputPhase").classList.add("hidden");
    if (gameMode === 1) {
      startGuessPhase1();
    } else if (gameMode === 2) {
      startGuessPhase2();
    } else {
      startGuessPhase3();
    }
  }
}

function startGuessPhase1() {
  revealedHabit = habits[Math.floor(Math.random() * habits.length)];
  document.getElementById("revealedHabit").textContent = revealedHabit;
  const select = document.getElementById("groupGuessSelect");
  select.innerHTML = `<option value="">-- 選択してください --</option>` +
    players.map(p => `<option value="${p}">${p}</option>`).join("");
  document.getElementById("guessPhase1").classList.remove("hidden");
}

function submitVoteMode1() {
  const selected = document.getElementById("groupGuessSelect").value;
  if (!selected) return alert("誰の暴露かを選んでください");
  const actual = habitMap[revealedHabit];
  const isCorrect = selected === actual;
  answerLogs["話し合いの回答"] = selected;
  const result = isCorrect
    ? `正解！<strong>${actual}</strong> の暴露でした。<br>勝者：${players.filter(p => p !== actual).join("、")}`
    : `不正解... 正解は <strong>${actual}</strong> でした。<br>勝者：${actual}`;
  document.getElementById("guessPhase1").classList.add("hidden");
  document.getElementById("resultDetails").innerHTML = result;
  document.getElementById("resultPhase").classList.remove("hidden");
}

function startGuessPhase2() {
  shuffledHabits = [...habits].sort(() => Math.random() - 0.5);
  const form = document.getElementById("guessForm2");
  form.innerHTML = "";
  players.forEach(player => {
    answerLogs[player] = [];
    form.innerHTML += `<h4>${player} の予想</h4>`;
    shuffledHabits.forEach(h => {
      const select = document.createElement("select");
      select.setAttribute("data-player", player);
      select.setAttribute("data-habit", h);
      select.innerHTML = `<option value="">${h} →</option>` +
        players
          .filter(p => habitMap[h] !== p)
          .map(p => `<option value="${p}">${p}</option>`)
          .join("");
      form.appendChild(select);
    });
  });
  document.getElementById("guessPhase2").classList.remove("hidden");
}

function submitVoteMode2() {
  const selects = document.querySelectorAll("#guessForm2 select");
  let complete = true;
  correctCount = {};
  players.forEach(p => correctCount[p] = 0);
  selects.forEach(sel => {
    const player = sel.getAttribute("data-player");
    const habit = sel.getAttribute("data-habit");
    const guess = sel.value;
    if (!guess) complete = false;
    if (!answerLogs[player]) answerLogs[player] = [];
    answerLogs[player].push({ habit, guess });
    if (guess === habitMap[habit]) correctCount[player]++;
  });
  if (!complete) return alert("すべての回答を入力してください");
  let resultHTML = "";
  Object.entries(answerLogs).forEach(([player, guesses]) => {
    resultHTML += `<h3>${player} の予想</h3><ul>`;
    guesses.forEach(({ habit, guess }) => {
      const correct = habitMap[habit];
      const isCorrect = guess === correct;
      resultHTML += `<li>「${habit}」 → ${guess} ： ${isCorrect ? '✅ 正解' : `❌ 不正解（正解は ${correct}）`}</li>`;
    });
    resultHTML += "</ul>";
  });
  document.getElementById("guessPhase2").classList.add("hidden");
  document.getElementById("resultDetails").innerHTML = resultHTML;
  document.getElementById("resultPhase").classList.remove("hidden");
}

function startGuessPhase3() {
  shuffledHabits = [...habits].sort(() => Math.random() - 0.5);
  currentHabitIndex = 0;
  answerLogs["繰り返し推理"] = [];
  document.getElementById("totalHabits").textContent = shuffledHabits.length;
  showNextHabitInLoop();
}

function showNextHabitInLoop() {
  if (currentHabitIndex >= shuffledHabits.length) {
    document.getElementById("guessPhase3").classList.add("hidden");
    document.getElementById("resultPhase").classList.remove("hidden");
    let summary = `<h3>繰り返し結果</h3><ul>`;
    answerLogs["繰り返し推理"].forEach(entry => {
      summary += `<li>「${entry.habit}」 → ${entry.guess} ： ${entry.guess === entry.correct ? '✅ 正解' : `❌ 不正解（正解：${entry.correct}）`} | 勝者：${entry.result}</li>`;
    });
    summary += `</ul>`;
    document.getElementById("resultDetails").innerHTML = summary;
    return;
  }
  const habit = shuffledHabits[currentHabitIndex];
  document.getElementById("currentHabitIndex").textContent = currentHabitIndex + 1;
  document.getElementById("currentHabitText").textContent = habit;
  const select = document.getElementById("groupGuessRepeat");
  select.innerHTML = `<option value="">-- 誰のクセ？ --</option>` +
    players.map(p => `<option value="${p}">${p}</option>`).join("");
  document.getElementById("guessPhase3").classList.remove("hidden");
}

function submitVoteMode3() {
  const guess = document.getElementById("groupGuessRepeat").value;
  if (!guess) return alert("誰かを選んでください");
  const habit = shuffledHabits[currentHabitIndex];
  const correct = habitMap[habit];
  const result = guess === correct ? players.filter(p => p !== correct).join("、") : correct;
  answerLogs["繰り返し推理"].push({ habit, guess, correct, result });
  currentHabitIndex++;
  showNextHabitInLoop();
}

function revealAnswers() {
  const list = document.getElementById("revealList");
  list.innerHTML = habits.map(h => `<li>${h} → ${habitMap[h]}</li>`).join("");
  const logDiv = document.getElementById("answerLog");
  logDiv.innerHTML = `<h3>回答ログ</h3>`;
  Object.entries(answerLogs).forEach(([p, logs]) => {
    logDiv.innerHTML += `<h4>${p}</h4><ul>` + (
      Array.isArray(logs)
        ? logs.map(a => `<li>${a.habit} → ${a.guess}${a.correct ? ` （正解：${a.correct}）` : ''}</li>`).join("")
        : `<li>${logs}</li>`
    ) + `</ul>`;
  });
  document.getElementById("resultPhase").classList.add("hidden");
  document.getElementById("finalResult").classList.remove("hidden");
}
