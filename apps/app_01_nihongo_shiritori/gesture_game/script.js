const topics = ["ゾウ", "バナナ", "マッチョ", "ピザ", "サメ", "忍者", "ドラゴン", "カンガルー"];
let timer;
let timeLeft = 20;

function startGame() {
  const topic = topics[Math.floor(Math.random() * topics.length)];
  document.getElementById("topicArea").textContent = "お題: " + topic;
  timeLeft = 20;
  document.getElementById("timer").textContent = "残り時間: " + timeLeft + "秒";
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = "残り時間: " + timeLeft + "秒";
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("timer").textContent = "時間終了！";
    }
  }, 1000);
  console.log("アクセスログ: お題表示 - " + topic);
}

function resetGame() {
  document.getElementById("topicArea").textContent = "ここにお題が表示されます";
  document.getElementById("timer").textContent = "残り時間: --秒";
  clearInterval(timer);
  console.log("アクセスログ: 次のお題へ");
}

function share() {
  alert("SNSで共有されました（模擬動作）");
  console.log("アクセスログ: SNSシェア");
}
