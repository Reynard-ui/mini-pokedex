/**
 * PixelPokeball — a round, pixel-art pokéball.
 *
 * Built from a 16×16 pixel map: a stepped-circle ball with a 1px black
 * outline, a pink top half (bright highlight top-left, dark shade on the
 * right edge + bottom-right), a white bottom half (light-gray shade on the
 * right), and a black center band with a square button.
 *
 * @param {number}  size  rendered pixel size (width/height)
 * @param {boolean} open  when true the center button shows a solid dark core
 */

const P = "#ff2fa0"; // pink top
const H = "#ff8ecb"; // pink highlight (top-left light)
const S = "#a40b64"; // pink shadow (right / bottom-right)
const K = "#141414"; // black outline / band
const W = "#ffffff"; // white bottom
const G = "#cfc9de"; // light-gray shade (bottom-right)

const COLORS = { K, P, H, S, W, G };

// CLOSED ball (white button core)
const CLOSED = [
  "....KKKKKKKK....", // 0
  "...KHHPPPPPPK...", // 1
  "..KHHPPPPPPSSK..", // 2
  "..KPPPPPPPPSSK..", // 3
  ".KPPPPPPPPPPSSK.", // 4
  ".KPPPPPPPPPPSSK.", // 5
  "KPPPPPPKKPPPPPSK", // 6
  "KKKKKKKWWKKKKKKK", // 7
  "KKKKKKKWWKKKKKKK", // 8
  "KWWWWWKWWKWWWGGK", // 9
  ".KWWWWWWWWWWGGK.", // 10
  ".KWWWWWWWWWWGGK.", // 11
  "..KWWWWWWWWGGK..", // 12
  "..KWWWWWWWWGGK..", // 13
  "...KWWWWWWGGK...", // 14
  "....KKKKKKKK....", // 15
];

// OPEN ball (dark button core)
const OPEN = CLOSED.map((row, i) =>
  i === 7 || i === 8 ? "KKKKKKKKKKKKKKKK" : row
);

// Pack the pixel map into horizontal <rect> runs (one row per color run).
function rectRuns(rows) {
  const runs = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === ".") {
        x += 1;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === c) end += 1;
      runs.push({ x, y, w: end - x, fill: COLORS[c] });
      x = end;
    }
  });
  return runs;
}

function PixelPokeball({ size = 22, open = false, className }) {
  const runs = rectRuns(open ? OPEN : CLOSED);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      {runs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}

export default PixelPokeball;
