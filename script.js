// 初期値とパラメータの設定
let y0 = 1; // 初期値 y(0)
let x0 = 0; // 初期時刻
let dx = 0.001; // x刻み
let X = 20; // シミュレーション終了時刻
const EPS = 1e-10; // 丸め誤差の許容範囲

// 導関数
function dydx(x, y) {
  return Math.sin((1 / 2) * x);
}

// オイラー法
function eulerMethod(y0, x0, dx, X) {
  let x = x0;
  let y = y0;
  let points = [{ x: x, y: y }];

  while (x < X) {
    y += dydx(x, y) * dx;
    x += dx;
    points.push({ x: x, y: y });
  }
  return points;
}

// 理論値
function RK4Method(y0, x0, dx, X) {
  let x = x0;
  let y = y0;
  let points = [{ x: x, y: y }];

  while (x < X) {
    const k1 = dydx(x, y);
    const k2 = dydx(x + dx / 2, y + (dx / 2) * k1);
    const k3 = dydx(x + dx / 2, y + (dx / 2) * k2);
    const k4 = dydx(x + dx, y + dx * k3);

    y += (dx / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x += dx;

    points.push({ x: x, y: y });
  }
  return points;
}

// 試行回数を計算
function trialCount(dx, X) {
  return (X / dx).toFixed(0);
}

// 表示する桁数の計算
const decimalPlaces = dx.toString().split(".")[1].length;

// 各手法で計算
const eulerPoints = eulerMethod(y0, x0, dx, X);
const exactPoints = RK4Method(y0, x0, dx, X);

// グラフ用データに変換
const labels = exactPoints.map((p) => p.x);
const eulerData = eulerPoints.map((p) => p.y);
const exactData = exactPoints.map((p) => p.y);

// 誤差を計算 (丸め誤差がEPS以下の場合はゼロとして扱う)
const eulerError = eulerData.map((y, i) =>
  Math.abs(y - exactData[i]) < EPS ? 0 : Math.abs(y - exactData[i])
);

// 誤差をオブジェクトの配列にまとめる
const errorData = labels.map((x, i) => ({
  x: x.toFixed(decimalPlaces),
  eulerError: eulerError[i],
}));

// 誤差が大きい順にソート
const sortedEulerErrors = errorData.sort((a, b) => b.eulerError - a.eulerError);

// 上位5つの誤差を抽出
const topEulerErrors = sortedEulerErrors.slice(0, 5);

// Chart.jsで解のグラフを表示
const ctx = document.getElementById("odeChart").getContext("2d");
new Chart(ctx, {
  type: "line",
  data: {
    labels: labels.map((label) => label.toFixed(decimalPlaces)),
    datasets: [
      {
        label: "オイラー法",
        data: eulerData,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        pointRadius: 0,
      },
      {
        label: "理論値",
        data: exactData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        pointRadius: 0,
      },
    ],
  },
  options: {
    responsive: false,
    scales: {
      x: { title: { display: false, text: "x" } },
      y: { title: { display: false, text: "y" } },
    },
  },
});

//　試行回数を表示
const countText = document.getElementById("trialCount");
const count = trialCount(dx, X);
countText.textContent = count;

// オイラー法の誤差の大きい順に上位5つを表形式で表示
const eulerTableBody = document
  .getElementById("eulerErrorTable")
  .getElementsByTagName("tbody")[0];
topEulerErrors.forEach((item) => {
  const row = document.createElement("tr");

  const xCell = document.createElement("td");
  xCell.textContent = item.x;
  row.appendChild(xCell);

  const eulerErrorCell = document.createElement("td");
  eulerErrorCell.textContent = item.eulerError.toFixed(10);
  row.appendChild(eulerErrorCell);

  eulerTableBody.appendChild(row);
});

// 誤差が最大のxを取得
const maxEulerErrorX = topEulerErrors[0].x;
const maxErrorX = Math.max(maxEulerErrorX);

// 拡大する範囲の開始と終了
const zoomStartX = Math.max(x0, maxErrorX - dx * 5);
const zoomEndX = Math.min(X, maxErrorX + dx * 5);

// 拡大する範囲のデータを抽出
const zoomLabels = labels.filter((x) => x >= zoomStartX && x <= zoomEndX);
const zoomEulerData = eulerPoints
  .filter((p) => p.x >= zoomStartX && p.x <= zoomEndX)
  .map((p) => p.y);
const zoomExactData = exactPoints
  .filter((p) => p.x >= zoomStartX && p.x <= zoomEndX)
  .map((p) => p.y);

// Chart.jsで拡大グラフを追加
const zoomCtx = document.getElementById("zoomChart").getContext("2d");
new Chart(zoomCtx, {
  type: "line",
  data: {
    labels: zoomLabels,
    datasets: [
      {
        label: "オイラー法 (拡大)",
        data: zoomEulerData,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
      },
      {
        label: "理論値 (拡大)",
        data: zoomExactData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
    ],
  },
  options: {
    responsive: false,
    scales: {
      x: { title: { display: false, text: "x (拡大)" } },
      y: { title: { display: false, text: "y" } },
    },
  },
});
