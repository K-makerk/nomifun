document.addEventListener("DOMContentLoaded", () => {
  const nameList = document.getElementById("name-list");
  const addNameBtn = document.getElementById("add-name");
  const shuffleBtn = document.getElementById("shuffle-button");
  const resultList = document.getElementById("result-list");

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

  addNameBtn.addEventListener("click", () => {
    createNameInput();
  });

  shuffleBtn.addEventListener("click", () => {
    const inputs = nameList.querySelectorAll("input");
    const names = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(name => name !== "");

    if (names.length === 0) {
      alert("名前を入力してください");
      return;
    }

    const shuffled = shuffleArray(names.slice());
    resultList.innerHTML = "";
    shuffled.forEach((name, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}番目：${name}`;
      resultList.appendChild(li);
    });
  });

  createNameInput();
  createNameInput();
});
