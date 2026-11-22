import type { Dom } from '../core/dom';
import { SEL } from '../core/selectors';
import type { State } from '../core/state';

export function context2d(
  canvas: HTMLCanvasElement,
  willReadFrequently = false,
): CanvasRenderingContext2D | null {
  return canvas.getContext('2d', { willReadFrequently });
}

/**
 * 验证码图片画布。标记层已改为 DOM 徽标，这里只负责背景图的绘制与
 * 显示尺寸测量（把 CSS 宽度换算回图片像素，供点击坐标使用）。
 */
export class CaptchaCanvas {
  constructor(
    private readonly dom: Dom,
    private readonly state: State,
  ) {}

  get element(): HTMLCanvasElement | null {
    return this.dom.query<HTMLCanvasElement>(SEL.image);
  }

  /** 画布像素尺寸随后端下发的 bg_width / bg_height 走，坐标换算才不失真。 */
  resize(width: number, height: number): void {
    const canvas = this.element;

    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  clear(): void {
    const canvas = this.element;
    const ctx = canvas && context2d(canvas);

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  setVisible(visible: boolean): void {
    const canvas = this.element;

    if (canvas) {
      // 用 visibility 而非 hidden，画布退出布局时舞台高度才不会塌，加载遮罩才有同款尺寸。
      canvas.style.visibility = visible ? 'visible' : 'hidden';
    }
  }

  /** 必须在画布可见后测量：visibility:hidden 时布局仍在，但显示宽度需先确定。 */
  measure(): void {
    const canvas = this.element;

    if (!canvas || canvas.width <= 0) {
      return;
    }

    const width = canvas.getBoundingClientRect().width || canvas.width;
    this.state.scale = width / canvas.width;
    this.state.invScale = canvas.width / width;
  }

  drawBackground(image: HTMLImageElement): void {
    const canvas = this.element;
    const ctx = canvas && context2d(canvas);

    if (!canvas || !ctx) {
      return;
    }

    const { imgWidth, imgHeight } = this.state;
    ctx.drawImage(image, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
  }
}
