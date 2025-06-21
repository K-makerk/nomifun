const themeMap = {
  "食べ物": "Q2095",
  "動物": "Q729",
  "地名": "Q515",
  "楽器": "Q34379"
};

let players = [];
let currentPlayerIndex = 0;
let usedWords = [];
let currentTheme = '';
let currentWord = '';
let timer;
let timeLimit = 10;

function startGame() {
  const playerInput = document.getElementById('playerInput').value.trim();
  players = playerInput.split(',').map(p => p.trim()).filter(p => p);
  if (players.length < 2) {
    alert("2人以上のプレイヤーを入力してください。");
    return;
  }

  const selectedTheme = document.getElementById('themeSelect').value;
  const themeKeys = Object.keys(themeMap);
  currentTheme = selectedTheme || themeKeys[Math.floor(Math.random() * themeKeys.length)];

  currentPlayerIndex = Math.floor(Math.random() * players.length);
  usedWords = [];
  currentWord = '';

  document.getElementById('setup').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('themeDisplay').innerText = `テーマ: ${currentTheme}`;
  updateTurnDisplay();
  startTimer();
}

function updateTurnDisplay() {
  const playerName = players[currentPlayerIndex];
  document.getElementById('turnDisplay').innerText = `👉 ${playerName} の番です`;
  document.getElementById('wordInput').value = '';
  document.getElementById('wordInput').focus();
  document.getElementById('usedWords').innerText = `使用済み単語: ${usedWords.join(', ')}`;
}

async function submitWord() {
  const input = document.getElementById('wordInput').value.trim().toLowerCase();
  if (!input) return;

  const isHiragana = /^[\u3040-\u309Fー]+$/.test(input);
  if (!isHiragana) {
    alert("ひらがなで入力してください。");
    return;
  }

  if (usedWords.includes(input)) {
    alert("この単語はすでに使われています。");
    return;
  }

  if (currentWord && input[0] !== currentWord.slice(-1)) {
    alert(`「${currentWord.slice(-1)}」から始まる単語を入力してください。`);
    eliminatePlayer();
    return;
  }

  const valid = await checkWordAgainstTheme(input, themeMap[currentTheme]);
  if (!valid) {
    alert("この単語はテーマに合っていません！");
    eliminatePlayer();
    return;
  }

  usedWords.push(input);
  currentWord = input;
  stopTimer();
  nextPlayer();
}

function nextPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  startTimer();
  updateTurnDisplay();
}

function eliminatePlayer() {
  const loser = players[currentPlayerIndex];
  alert(`${loser} は脱落しました！`);
  players.splice(currentPlayerIndex, 1);

  if (players.length === 1) {
    endGame(players[0]);
    return;
  }

  currentPlayerIndex = currentPlayerIndex % players.length;
  startTimer();
  updateTurnDisplay();
}

function startTimer() {
  let time = timeLimit;
  document.getElementById('timeLeft').innerText = time;
  timer = setInterval(() => {
    time--;
    document.getElementById('timeLeft').innerText = time;
    if (time <= 0) {
      clearInterval(timer);
      alert(`${players[currentPlayerIndex]} のタイムアウト！`);
      eliminatePlayer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function endGame(winner) {
  stopTimer();
  document.getElementById('game').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('winnerMessage').innerText = `🏆 勝者: ${winner}`;
}

async function checkWordAgainstTheme(word, themeId) {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${word}&language=ja&format=json&origin=*`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    if (!data.search || data.search.length === 0) return false;

    const entityId = data.search[0].id;
    const detailRes = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`);
    const detailData = await detailRes.json();
    const claims = detailData.entities[entityId].claims;
    const instances = claims.P31?.map(claim => claim.mainsnak.datavalue?.value?.id);
    return instances?.includes(themeId);
  } catch (err) {
    console.error("判定中にエラーが発生:", err);
    return false;
  }
}
