document.addEventListener("DOMContentLoaded", () => {
  const nameList = document.getElementById("name-list");
  const resultList = document.getElementById("result-list");
  const historyList = document.getElementById("history-list");
  const drumSound = document.getElementById("drum-sound");
  const twitterShare = document.getElementById("twitter-share");
  const lineShare = document.getElementById("line-share");

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
    history.unshift([...shuffled]);
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
    void resultList.offsetWidth;
    resultList.classList.add("fade-in");

    shuffled.forEach((name, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}番目：${name}`;
      resultList.appendChild(li);
    });

    document.getElementById("result-area").classList.remove("hidden");

    // SNSシェアリンク更新
    const text = encodeURIComponent(`ランダム順番決定：${shuffled.join(" → ")}`);
    twitterShare.href = `https://twitter.com/intent/tweet?text=${text}`;
    lineShare.href = `https://social-plugins.line.me/lineit/share?text=${text}`;
  }

  function handleShuffle() {
    const inputs = nameList.querySelectorAll("input");
    const names = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(name => name !== "");

    if (names.length < 2) {
      alert("2人以上の名前を入力してください");
      return;
    }

    drumSound.currentTime = 0;
    drumSound.play();

    const shuffled = shuffleArray([...names]);
    showResult(shuffled);
    updateHistory(shuffled);

    console.log("アクセスログ:", shuffled); // AdSense審査用ダミーログ
  }

  window.addName = () => createNameInput();
  window.shuffleNames = () => handleShuffle();
  window.reshuffle = () => handleShuffle();

  window.saveResultImage = () => {
    html2canvas(document.querySelector("#result-area")).then(canvas => {
      const link = document.createElement("a");
      link.download = "random_order_result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  // 初期表示：2つ入力欄
  createNameInput();
  createNameInput();
});
