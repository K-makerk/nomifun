let players = [];
let habits = [];
let habitMap = {};
let gameMode = 1;
let revealedHabit = "";
let voteLogs = [];
let answerLogs = {};

function addPlayerInput() {
  const div = document.createElement("div");
  div.innerHTML = `<input placeholder="プレイヤー名" />`;
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

  gameMode = parseInt(document.querySelector("input[name='gameMode']:checked").value);
  document.getElementById("setup").classList.add("hidden");

  const habitDiv = document.getElementById("habitInputs");
  habitDiv.innerHTML = "";
  players.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `<label>${p} の暴露：</label><input data-player="${p}" />`;
    habitDiv.appendChild(div);
  });
  document.getElementById("questionPhase").classList.remove("hidden");
}

function submitHabits() {
  const inputs = document.querySelectorAll("#habitInputs input");
  habits = [];
  habitMap = {};
  answerLogs = {};
  inputs.forEach(input => {
    const text = input.value.trim();
    const owner = input.dataset.player;
    if (!text) return;
    habits.push(text);
    habitMap[text] = owner;
  });

  if (habits.length !== players.length) {
    alert("全員の暴露を入力してください！");
    return;
  }

  document.getElementById("questionPhase").classList.add("hidden");

  if (gameMode === 1) {
    revealedHabit = habits[Math.floor(Math.random() * habits.length)];
    document.getElementById("revealedHabit").textContent = `"${revealedHabit}"`;
    const container = document.getElementById("groupVoteInputs");
    container.innerHTML = "";
    players.forEach(p => {
      const div = document.createElement("div");
      div.innerHTML = `<label>${p} の回答：</label>
        <select data-player="${p}">
          <option value="">-- 誰の暴露だと思う？ --</option>
          ${players.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
        </select>`;
      container.appendChild(div);
    });
    document.getElementById("guessPhase1").classList.remove("hidden");
  } else {
    const shuffledHabits = [...habits].sort(() => Math.random() - 0.5);
    const container = document.getElementById("anonymousHabits");
    const form = document.getElementById("guessForm");
    container.innerHTML = "";
    form.innerHTML = "";
    shuffledHabits.forEach((habit, i) => {
      const section = document.createElement("div");
      section.innerHTML = `<h4>暴露 ${i + 1}: ${habit}</h4>`;
      players.forEach(p => {
        section.innerHTML += `<label>${p} の予想：
          <select data-player="${p}" data-habit="${habit}">
            <option value="">-- 選択 --</option>
            ${players.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
          </select></label><br>`;
      });
      form.appendChild(section);
    });
    document.getElementById("guessPhase2").classList.remove("hidden");
  }
}

function submitVoteMode1() {
  const selects = document.querySelectorAll("#groupVoteInputs select");
  const votes = [];
  const actual = habitMap[revealedHabit];
  let correctCount = 0;

  selects.forEach(sel => {
    const p = sel.dataset.player;
    const guess = sel.value;
    if (!guess) return alert("全員分の入力が必要です");
    votes.push({ player: p, guess });
    answerLogs[p] = guess;
    if (guess === actual) correctCount++;
  });

  const detail = document.getElementById("resultDetails");
  if (correctCount === 0) {
    detail.innerHTML = `誰も当てられなかった！<strong>${actual}</strong> の勝ち！`;
  } else {
    const winners = votes.filter(v => v.guess !== actual).map(v => v.player);
    detail.innerHTML = `正解は <strong>${actual}</strong><br>
      勝者：${winners.join('、') || '(なし)'}`;
  }

  document.getElementById("guessPhase1").classList.add("hidden");
  document.getElementById("resultPhase").classList.remove("hidden");
}

function submitVoteMode2() {
  const selects = document.querySelectorAll("#guessForm select");
  let complete = true;
  let grouped = {};

  selects.forEach(sel => {
    const player = sel.dataset.player;
    const habit = sel.dataset.habit;
    const guess = sel.value;
    if (!guess) complete = false;
    if (!grouped[player]) grouped[player] = [];
    grouped[player].push({ habit, guess });
  });

  if (!complete) {
    alert("すべての選択肢を埋めてください。");
    return;
  }

  answerLogs = grouped;

  const detail = document.getElementById("resultDetails");
  detail.innerHTML = "";

  Object.entries(grouped).forEach(([player, answers]) => {
    detail.innerHTML += `<h4>${player} の回答</h4><ul>`;
    answers.forEach(({ habit, guess }) => {
      const correct = habitMap[habit];
      const isCorrect = guess === correct;
      detail.innerHTML += `<li>${habit} → ${guess}：${isCorrect ? '✅ 正解' : `❌ 不正解（正解：${correct}）`}</li>`;
    });
    detail.innerHTML += `</ul>`;
  });

  document.getElementById("guessPhase2").classList.add("hidden");
  document.getElementById("resultPhase").classList.remove("hidden");
}

function revealAnswers() {
  const list = document.getElementById("revealList");
  list.innerHTML = habits.map(h => `<li>${h} → ${habitMap[h]}</li>`).join("");

  const logDiv = document.getElementById("answerLog");
  logDiv.innerHTML = `<h3>みんなの回答</h3>`;
  if (gameMode === 1) {
    logDiv.innerHTML += `<ul>${Object.entries(answerLogs).map(([p, g]) =>
      `<li>${p} の回答：${g}</li>`).join("")}</ul>`;
  } else {
    Object.entries(answerLogs).forEach(([p, answers]) => {
      logDiv.innerHTML += `<h4>${p}</h4><ul>` +
        answers.map(a => `<li>${a.habit} → ${a.guess}</li>`).join("") +
        `</ul>`;
    });
  }

  document.getElementById("resultPhase").classList.add("hidden");
  document.getElementById("finalResult").classList.remove("hidden");
}
