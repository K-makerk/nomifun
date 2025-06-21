let players = [];
let habits = [];
let habitMap = {};
let gameMode = 1;
let revealedHabit = "";
let voteRecords = [];
let individualGuesses = [];

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
    const form = document.getElementById("guessForm");
    form.innerHTML = "";
    individualGuesses = [];

    shuffledHabits.forEach((habit, index) => {
      const div = document.createElement("div");
      div.innerHTML = `<p>${index + 1}. ${habit}</p>`;
      players.forEach(player => {
        div.innerHTML += `
          <label>${player} の予想: 
            <select data-player="${player}" data-habit="${habit}">
              <option value="">-- 誰の暴露？ --</option>
              ${players.map(p => `<option value="${p}">${p}</option>`).join("")}
            </select>
          </label><br>`;
      });
      form.appendChild(div);
    });
    document.getElementById("guessPhase2").classList.remove("hidden");
  }
}

function submitVoteMode1() {
  const selects = document.querySelectorAll("#groupVoteInputs select");
  const result = [];
  let actual = habitMap[revealedHabit];

  selects.forEach(sel => {
    const player = sel.dataset.player;
    const guess = sel.value;
    result.push({ player, guess, correct: guess === actual });
  });

  voteRecords = result;

  const detail = document.getElementById("resultDetails");
  const matched = result.filter(r => r.guess === actual);
  if (matched.length === 0) {
    detail.innerHTML = `誰も当てられなかった！<strong>${actual}</strong> の勝ち！`;
  } else {
    const losers = result.filter(r => r.guess === actual).map(r => r.player).join(", ");
    const winners = result.filter(r => r.guess !== actual).map(r => r.player).join(", ");
    detail.innerHTML = `正解は <strong>${actual}</strong> でした。<br>
      当てた人：${losers}<br>
      勝者：${winners}`;
  }

  document.getElementById("guessPhase1").classList.add("hidden");
  document.getElementById("resultPhase").classList.remove("hidden");
}

function submitVoteMode2() {
  const selects = document.querySelectorAll("#guessForm select");
  const grouped = {};

  selects.forEach(sel => {
    const player = sel.dataset.player;
    const habit = sel.dataset.habit;
    const guess = sel.value;
    if (!grouped[player]) grouped[player] = [];
    grouped[player].push({ habit, guess });
  });

  const detail = document.getElementById("resultDetails");
  let html = "";

  for (const player in grouped) {
    html += `<h4>${player} の予想</h4><ul>`;
    grouped[player].forEach(entry => {
      const correct = habitMap[entry.habit];
      const isCorrect = entry.guess === correct;
      html += `<li>${entry.habit} → ${entry.guess} ： ${isCorrect ? "✅正解" : `❌不正解（正解は ${correct}）`}</li>`;
    });
    html += "</ul>";
  }

  voteRecords = grouped;
  document.getElementById("guessPhase2").classList.add("hidden");
  document.getElementById("resultPhase").classList.remove("hidden");
  detail.innerHTML = html;
}

function revealAnswers() {
  const list = document.getElementById("revealList");
  list.innerHTML = habits.map(h => `<li>${h} → ${habitMap[h]}</li>`).join("");
  document.getElementById("resultPhase").classList.add("hidden");
  document.getElementById("finalResult").classList.remove("hidden");
}
