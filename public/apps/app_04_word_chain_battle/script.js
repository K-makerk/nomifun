const themeMap = {
  "食べ物": "Q2095",
  "動物": "Q729",
  "地名": "Q515"
};

let players = [];
let currentPlayerIndex = 0;
let usedWords = [];
let currentTheme = '';
let currentWord = '';
let timer;
let timeLimit = 20;
const validationCache = {};

function addPlayerInput() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="プレイヤー名" />`;
  document.getElementById("playerInputs").appendChild(div);
}

function removePlayerInput() {
  const container = document.getElementById("playerInputs");
  if (container.children.length > 2) {
    container.removeChild(container.lastElementChild);
  } else {
    alert("最低2人必要です");
  }
}

function confirmPlayers() {
  const inputs = document.querySelectorAll("#playerInputs input");
  players = [];
  inputs.forEach(input => {
    const name = input.value.trim();
    if (name) players.push(name);
  });
  if (players.length < 2) return alert("2人以上のプレイヤー名を入力してください");

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

  if (!/^[\u3040-\u309Fー]+$/.test(input)) {
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

  const valid = await validateWord(input, themeMap[currentTheme], currentTheme);
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

// ==================== Wikidata 多重検証 ====================

async function validateWord(word, themeId, themeName) {
  const key = `${word}_${themeName}`;
  if (validationCache[key] !== undefined) {
    return validationCache[key];
  }

  const id = await getEntityIdFromWikidata(word);
  if (!id) return false;

  const results = await Promise.all([
    hasInstanceOf(id, themeId),
    isSubclassOf(id, themeId, 5),
    isInWikipediaCategory(word, themeName)
  ]);

  const result = results.some(Boolean);
  validationCache[key] = result;
  return result;
}

async function getEntityIdFromWikidata(word) {
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${word}&language=ja&format=json&origin=*`;
  const res = await fetch(searchUrl);
  const data = await res.json();
  return data.search?.[0]?.id || null;
}

async function hasInstanceOf(entityId, themeId) {
  try {
    const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`);
    const data = await res.json();
    const claims = data.entities[entityId].claims;
    const instances = claims.P31?.map(c => c.mainsnak.datavalue?.value?.id);
    return instances?.includes(themeId) || false;
  } catch {
    return false;
  }
}

async function isSubclassOf(entityId, targetId, depth = 5) {
  if (depth <= 0) return false;
  try {
    const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`);
    const data = await res.json();
    const claims = data.entities[entityId].claims;
    const subclasses = claims.P279?.map(c => c.mainsnak.datavalue?.value?.id);
    if (!subclasses) return false;
    if (subclasses.includes(targetId)) return true;
    for (const sub of subclasses) {
      if (await isSubclassOf(sub, targetId, depth - 1)) return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function isInWikipediaCategory(word, keyword) {
  try {
    const url = `https://ja.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodeURIComponent(word)}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    const cats = page.categories?.map(c => c.title);
    return cats?.some(cat => cat.includes(keyword)) || false;
  } catch {
    return false;
  }
}
