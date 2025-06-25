const startButton = document.getElementById("startButton");
const message = document.getElementById("message");
const result = document.getElementById("result");

let startTime = 0;
let goTimeout = null;
let waitingForClick = false;
let gameActive = false;

startButton.addEventListener("click", () => {
  if (gameActive) return;
  gameActive = true;
  startButton.disabled = true;
  message.textContent = "Ready...";
  result.textContent = "";
  waitingForClick = false;

  const delay = Math.floor(Math.random() * 3000) + 2000;

  goTimeout = setTimeout(() => {
    message.textContent = "Go!";
    startTime = performance.now();
    waitingForClick = true;
  }, delay);
});

document.body.addEventListener("click", (e) => {
  if (!gameActive) return;

  if (!waitingForClick) {
    clearTimeout(goTimeout);
    message.textContent = "フライング！失格！";
    result.textContent = "";
    resetGame();
  } else {
    const reactionTime = (performance.now() - startTime).toFixed(2);
    message.textContent = "成功！";
    result.textContent = `反応時間：${reactionTime} ms`;
    resetGame();
  }
});

function resetGame() {
  startButton.disabled = false;
  waitingForClick = false;
  gameActive = false;
}
