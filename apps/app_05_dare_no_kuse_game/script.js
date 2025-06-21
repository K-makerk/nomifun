let players = [];
let habits = [];
let habitMap = {};
let gameMode = 1;
let revealedHabit = "";
let voteResult = {};
let guessForm = document.getElementById("guessForm");

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
  players.forEach(p => voteResult[p] = {});
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
    const voteDiv = document.getElementById("voteOptions");
    voteDiv.innerHTML = "";
    players.forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = p;
      btn.onclick = () => {
        document.querySelectorAll("#voteOptions button").forEach(b => b.disabled = false);
        btn.disabled = true;
        btn.dataset.selected = "true";
      };
      voteDiv.appendChild(btn);
    });
    document.getElementById("guessPhase1").classList.remove("hidden");
  } else {
    guessForm.innerHTML = "";
    habits.forEach((h, i) => {
      const field = document.createElement("div");
      field.innerHTML = `<p>${i + 1}. ${h}</p><select name="guess${i}">
        <option value="">-- 誰の暴露？ --</option>
        ${players.map(p => `<option value="${p}">${p}</option>`).join("")}
      </select>`;
      guessForm.appendChild(field);
    });
    document.getElementById("guessPhase2").classList.remove("hidden");
  }
}

function submitVoteMode1() {
  const selected = document.querySelector("#voteOptions button[data-selected='true']");
  if (!selected) {
    alert("誰か1人に投票してください！");
    return;
  }
  const voted = selected.textContent;
  const actual = habitMap[revealedHabit];

  const detail = document.getElementById("resultDetails");
  if (voted === actual) {
    detail.innerHTML = `正解！<strong>${actual}</strong> の暴露でした。<br>みんなの勝ち！`;
  } else {
    detail.innerHTML = `不正解...<strong>${actual}</strong> の暴露でした。<br>${actual} の勝ち！`;
  }

  document.getElementById("guessPhase1").classList.add("hidden");
  document.getElementById("resultPhase").classList.remove("hidden");
}

function submitVoteMode2() {
  const selects = document.querySelectorAll("#guessForm select");
  const results = [];
  let incomplete = false;
  selects.forEach((sel, i) => {
    const selected = sel.value;
    const habit = habits[i];
    const correct = habitMap[habit];
    if (!selected) incomplete = true;
    results.push({ guesser: players[i], target: selected, correct });
  });

  if (incomplete) {
    alert("全ての暴露に対して誰かを選んでください");
    return;
  }

  const detail = document.getElementById("resultDetails");
  detail.innerHTML = results.map(r =>
    `<p><strong>${r.guesser}</strong> の回答：${r.target} → ${r.target === r.correct ? '✅ 正解！' : '❌ 不正解（正解は ' + r.correct + '）'}</p>`
  ).join("");

  document.getElementById("guessPhase2").classList.add("hidden");
  document.getElementById("resultPhase").classList.remove("hidden");
}

function revealAnswers() {
  const list = document.getElementById("revealList");
  list.innerHTML = habits.map(h => `<li>${h} → ${habitMap[h]}</li>`).join("");
  document.getElementById("resultPhase").classList.add("hidden");
  document.getElementById("finalResult").classList.remove("hidden");
}
