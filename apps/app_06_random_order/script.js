document.addEventListener("DOMContentLoaded", () => {
  const nameList = document.getElementById("name-list");
  const addNameBtn = document.getElementById("add-name");
  const shuffleBtn = document.getElementById("shuffle-button");
  const resultList = document.getElementById("result-list");
  const historyList = document.getElementById("history-list");
  const drumSound = document.getElementById("drum-sound");

  const history = [];

  function createNameInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "名前を入力";
    nameList.appendChild(input);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function updateHistory(shuffled) {
    history.unshift(shuffled.slice()); // コピーして保存
    if (history.length > 5) history.pop();

    historyList.innerHTML = "";
    history.forEach((set, idx) => {
      const li = document.createElement("li");
      li.textContent = `${idx + 1}回前：` + set.join(" → ");
      historyList.appendChild(li);
    });
  }

  function showResult(shuffled) {
    resultList.innerHTML = "";
    resultList.classList.remove("fade-in");
    void resultList.offsetWidth; // 再レンダリング強制（アニメ再実行のため）
    resultList.classList.add("fade-in");

    shuffled.forEach((name, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}番目：${name}`;
      resultList.appendChild(li);
    });
  }

  function handleShuffle() {
    const inputs = nameList.querySelectorAll("input");
    const names = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(name => name !== "");

    if (names.length === 0) {
      alert("名前を入力してください");
      return;
    }

    drumSound.currentTime = 0;
    drumSound.play();

    const shuffled = shuffleArray(names.slice());
    showResult(shuffled);
    updateHistory(shuffled);
  }

  addNameBtn.addEventListener("click", () => {
    createNameInput();
  });

  shuffleBtn.addEventListener("click", () => {
    handleShuffle();
  });

  // 初期表示：2つ入力欄
  createNameInput();
  createNameInput();
});
