/**
 * 演示页专用：在浏览器里画出与 xq-app-admin 后端同构的点选验证码图片。
 * 背景是程序化生成的渐变纹理，不引入任何第三方素材。
 * 这不是安全实现，只为让组件在没有真实后端时也能完整跑通。
 */

const CHARS = '天地人和风云山水日月星辰春夏秋冬东南西北中花草木石金玉龙虎鹤松竹梅兰菊';

export interface ClickImage {
  dataUri: string;
  hint: string;
  answers: { x: number; y: number }[];
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function context(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('演示环境不支持 canvas 2d');
  }

  return ctx;
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function paintBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const hue = randomInt(0, 359);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsl(${hue}, 62%, 62%)`);
  gradient.addColorStop(1, `hsl(${(hue + 48) % 360}, 58%, 44%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.arc(
      randomInt(0, width),
      randomInt(0, height),
      randomInt(8, 42),
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = `hsla(${(hue + randomInt(-40, 40) + 360) % 360}, 70%, ${randomInt(35, 80)}%, 0.28)`;
    ctx.fill();
  }
}

export function renderClick(width: number, height: number, count: number): ClickImage {
  const canvas = makeCanvas(width, height);
  const ctx = context(canvas);
  paintBackground(ctx, width, height);

  const pool = [...CHARS];
  const chars: string[] = [];

  for (let i = 0; i < count; i++) {
    chars.push(pool.splice(randomInt(0, pool.length - 1), 1)[0]);
  }

  const cols = Math.max(2, Math.ceil(Math.sqrt(count)));
  const rows = Math.max(2, Math.ceil(count / cols));
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const answers: { x: number; y: number }[] = [];

  ctx.font = 'bold 26px "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  chars.forEach((char, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = Math.round(col * cellWidth + cellWidth / 2 + randomInt(-12, 12));
    const y = Math.round(row * cellHeight + cellHeight / 2 + randomInt(-10, 10));
    answers.push({ x, y });

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((randomInt(-25, 25) * Math.PI) / 180);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.strokeText(char, 0, 0);
    ctx.fillStyle = `hsl(${randomInt(0, 359)}, 85%, 32%)`;
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  return {
    dataUri: canvas.toDataURL('image/png'),
    hint: `请依次点击：${chars.join(' → ')}`,
    answers,
  };
}