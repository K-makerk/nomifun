const themes = {
  食べ物: ['りんご', 'ごはん', 'なっとう', 'うどん', 'んまんじゅう'],
  動物: ['ねこ', 'こいぬ', 'うま', 'まんとひひ', 'ひつじ'],
  地名: ['とうきょう', 'うつのみや', 'やまがた', 'たいぺい']
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
  const themeKeys = Object.keys(themes);
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

function submitWord() {
  const input = document.getElementById('wordInput').value.trim().toLowerCase();
  if (!input) return;

  const isHiragana = /^[\u3040-\u309Fー]+$/.test(input);
  if (!isHiragana) {
    alert("ひらがなで入力してください。");
    return;
  }

  const words = themes[currentTheme];
  if (!words.some(w => w.startsWith(input[0]))) {
    alert("この単語はテーマに合っていない可能性があります。");
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
