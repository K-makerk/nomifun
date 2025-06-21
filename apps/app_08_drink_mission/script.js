console.log('Loaded');const missions = [
  "右の人と乾杯！",
  "5秒で飲み干せ！",
  "誰かにお酒をついでもらえ！",
  "口に手を当てて一口飲め！",
  "その場で3回回ってから飲め！",
  "全員に自分の良いところを1つ言ってもらう！",
  "逆隣の人と腕を組んで飲め！",
  "自分の飲み物をシャッフル！",
  "他の人のグラスで一口飲め！",
  "真顔で飲み干せ！笑ったらもう一杯！",
  "誰かの名前を叫びながら飲め！",
  "誰かのモノマネをしながら飲め！",
  "右隣の人の乾杯の音頭で飲め！",
  "片手だけで注いで飲め！",
  "その場で1分間ダンスしてから飲め！"
];

document.getElementById("showMissionBtn").addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * missions.length);
  document.getElementById("missionDisplay").textContent = missions[randomIndex];
});
