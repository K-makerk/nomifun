const questions = [
  {
    question: "好きな食べ物は？",
    topicA: "ラーメン", topicB: "うどん"
  },
  {
    question: "理想の休日は？",
    topicA: "映画館", topicB: "家でゴロゴロ"
  },
  {
    question: "子どもの頃の夢は？",
    topicA: "宇宙飛行士", topicB: "消防士"
  }
];

let players = [];
let answers = [];
let twins = [];
let currentQuestion = 0;

const main = document.getElementById("main");

function showPlayerForm() {
  main.innerHTML = `
    <h2>プレイヤー登録（5人以上）</h2>
    <textarea id="names" rows="6" placeholder="名前を改行で入力してください（例：たかし\\nゆうこ\\n…）"></textarea>
    <button onclick="registerPlayers()">登録する</button>
  `;
}

function registerPlayers() {
  const lines = document.getElementById("names").value.trim().split("\n").map(x => x.trim()).filter(x => x);
  if (lines.length < 5) {
    alert("5人以上必要です！");
    return;
  }
  players = lines.map(name => ({ name }));
  twins = pickRandomTwins(players.length);
  showQuestion();
}

function pickRandomTwins(n) {
  const shuffled = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function showQuestion() {
  if (currentQuestion >= questions.length) {
    showVote();
    return;
  }

  const q = questions[currentQuestion];
  main.innerHTML = `<h2>質問：${q.question}</h2>`;
  answers = [];

  players.forEach((p, i) => {
    const topic = twins.includes(i) ? q.topicA : q.topicB;
    main.innerHTML += `
      <div>
        <p><strong>${p.name}さん</strong>（あなたのお題：<strong>${topic}</strong>）</p>
        <input type="text" id="ans_${i}" placeholder="あなたの回答を入力してください">
      </div>
    `;
  });

  main.innerHTML += `<button onclick="collectAnswers()">送信</button>`;
}

function collectAnswers() {
  let valid = true;
  players.forEach((p, i) => {
    const val = document.getElementById("ans_" + i).value.trim();
    if (!val) {
      alert(p.name + "さんの回答が空白です！");
      valid = false;
    }
    if (!answers[i]) answers[i] = [];
    answers[i][currentQuestion] = val;
  });

  if (!valid) return;

  currentQuestion++;
  showQuestion();
}

function showVote() {
  main.innerHTML = "<h2>全員の回答</h2>";

  players.forEach((p, i) => {
    main.innerHTML += "<div><strong>" + p.name + "</strong><ul>" +
      answers[i].map(a => "<li>" + a + "</li>").join("") +
      "</ul></div>";
  });

  main.innerHTML += "<h2>誰が双子だと思う？（2人選んでください）</h2>";
  players.forEach((p, i) => {
    main.innerHTML += `
      <label><input type="checkbox" name="vote" value="${i}"> ${p.name}</label><br>
    `;
  });

  main.innerHTML += '<button onclick="finalVote()">投票する</button>';
}

function finalVote() {
  const selected = Array.from(document.querySelectorAll("input[name='vote']:checked")).map(cb => parseInt(cb.value));
  if (selected.length !== 2) {
    alert("2人選んでください！");
    return;
  }

  const correct = twins.sort().join(",") === selected.sort().join(",") ? "🎉 一般人チームの勝ち！" : "🌀 双子チームの勝ち！";
  main.innerHTML = "<h2>結果発表</h2><p>選ばれた双子：" + selected.map(i => players[i].name).join(" & ") +
    "</p><p>本当の双子：" + twins.map(i => players[i].name).join(" & ") + "</p><h2>" + correct + "</h2>";
}

showPlayerForm();
