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

// ==================== 多重テーマ判定ロジック ====================

async function validateWord(word, themeId, themeName) {
  const id = await getEntityIdFromWikidata(word);
  if (!id) return false;
  if (await hasInstanceOf(id, themeId)) return true;
  if (await isSubclassOf(id, themeId, 5)) return true;
  if (await isInWikipediaCategory(word, themeName)) return true;
  return false;
}

async function getEntityIdFromWikidata(word) {
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${word}&language=ja&format=json&origin=*`;
  const res = await fetch(searchUrl);
  const data = await res.json();
  return data.search?.[0]?.id || null;
}

async function hasInstanceOf(entityId, themeId) {
  const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`);
  const data = await res.json();
  const claims = data.entities[entityId].claims;
  const instances = claims.P31?.map(c => c.mainsnak.datavalue?.value?.id);
  return instances?.includes(themeId) || false;
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
    for (const subclass of subclasses) {
      if (await isSubclassOf(subclass, targetId, depth - 1)) return true;
    }
  } catch (e) {
    console.warn("P279 subclass check error:", e);
  }
  return false;
}

async function isInWikipediaCategory(word, themeKeyword) {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodeURIComponent(word)}&format=json&origin=*`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query?.pages;
  const page = Object.values(pages)[0];
  const categories = page.categories?.map(c => c.title);
  return categories?.some(cat => cat.includes(themeKeyword)) || false;
}
