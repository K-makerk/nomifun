let startButton = document.getElementById("startButton");
let message = document.getElementById("message");
let result = document.getElementById("result");

let startTime = 0;
let goTimeout = null;
let waitingForClick = false;

startButton.addEventListener("click", () => {
  startButton.disabled = true;
  message.textContent = "Ready...";
  result.textContent = "";
  waitingForClick = false;

  const delay = Math.random() * 3000 + 2000; // 2〜5秒後にGo!

  goTimeout = setTimeout(() => {
    message.textContent = "Go!";
    startTime = performance.now();
    waitingForClick = true;
  }, delay);
});

document.body.addEventListener("click", () => {
  if (!startButton.disabled) return; // ゲームが始まっていない

  if (!waitingForClick) {
    clearTimeout(goTimeout);
    message.textContent = "フライング！失格！";
    result.textContent = "";
    startButton.disabled = false;
  } else {
    const reactionTime = (performance.now() - startTime).toFixed(2);
    message.textContent = "成功！";
    result.textContent = `反応時間：${reactionTime} ms`;
    waitingForClick = false;
    startButton.disabled = false;
  }
});
