const questions = [
  {
    question: "好きな食べ物は？",
    twinTopic: "ラーメン", othersTopic: "うどん"
  },
  {
    question: "理想の休日は？",
    twinTopic: "映画館", othersTopic: "家でゴロゴロ"
  },
  {
    question: "子どもの頃の夢は？",
    twinTopic: "宇宙飛行士", othersTopic: "消防士"
  }
];

let players = [];
let twins = [];
let answers = [];
let currentPlayer = 0;

const main = document.getElementById("main");

window.registerPlayers = function() {
  const lines = document.getElementById("names").value.trim().split("\n").map(x => x.trim()).filter(x => x);
  if (lines.length < 5) {
    alert("5人以上必要です！");
    return;
  }
  players = lines.map(name => ({ name }));
  twins = pickRandomTwins(players.length);
  answers = Array(players.length).fill(null).map(() => []);
  currentPlayer = 0;
  showNextAnswerInput();
};

function pickRandomTwins(n) {
  const shuffled = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function showPlayerForm() {
  main.innerHTML = `
    <h2>プレイヤー登録（5人以上）</h2>
    <textarea id="names" rows="6" placeholder="名前を改行で入力してください（例：たかし\\nゆうこ\\n…）"></textarea>
    <button onclick="registerPlayers()">登録する</button>
  `;
}

function showNextAnswerInput() {
  if (currentPlayer >= players.length) {
    showAllAnswers();
    return;
  }

  const p = players[currentPlayer];
  const isTwin = twins.includes(currentPlayer);
  const otherTwinIndex = twins.find(i => i !== currentPlayer);
  main.innerHTML = `
    <h2>${p.name}さんのターン</h2>
    <p>あなたのお題：<strong>${isTwin ? questions[0].twinTopic : questions[0].othersTopic}</strong>（←これは1つ目のお題の例です。他も同様に切り替わっています）</p>
    ${isTwin ? `<p>※もう1人の双子：<strong>${players[otherTwinIndex].name}</strong></p>` : ""}
    <form id="answerForm">
      ${questions.map((q, idx) => {
        const topic = isTwin ? q.twinTopic : q.othersTopic;
        return `
          <p><strong>質問${idx + 1}:</strong> ${q.question}</p>
          <p>お題（あなたに与えられた状況）: <strong>${topic}</strong></p>
          <input type="text" id="q_${idx}" placeholder="この質問への回答を入力" required />
        `;
      }).join("")}
      <button type="submit">送信</button>
    </form>
  `;

  document.getElementById("answerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const playerAnswers = [];
    for (let i = 0; i < questions.length; i++) {
      const val = document.getElementById(`q_${i}`).value.trim();
      if (!val) {
        alert(`質問${i + 1}の回答が空白です！`);
        return;
      }
      playerAnswers.push(val);
    }
    answers[currentPlayer] = playerAnswers;
    currentPlayer++;
    showNextAnswerInput();
  });
}

function showAllAnswers() {
  main.innerHTML = "<h2>全員の回答</h2>";
  players.forEach((p, i) => {
    main.innerHTML += `<div><strong>${p.name}</strong><ul>` +
      answers[i].map(a => `<li>${a}</li>`).join("") +
      "</ul></div>";
  });
  main.innerHTML += `<button onclick="showTwinGuessPhase()">双子を当てる</button>`;
}

window.showTwi

