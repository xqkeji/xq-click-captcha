import type { Dom } from '../core/dom';
import { CLS, SEL } from '../core/selectors';
import type { ClickPoint } from '../core/types';
import type { CaptchaCanvas } from '../render/canvas';

/** 与样式表中标记层的 opacity transition 时长一致。 */
const FADE_MS = 260;

/**
 * 点击标记完全用 DOM 徽标实现：每点一次在覆盖层放一个带序号的圆标，
 * 校验失败时把对应徽标换成错误样式。百分比定位让徽标随画布等比缩放，
 * 不依赖画布像素坐标系，也不绘制任何叉号图形。
 */
export class MarkerRenderer {
  private readonly badges: HTMLElement[] = [];
  private fadeTimer: number | null = null;

  constructor(
    private readonly dom: Dom,
    private readonly canvas: CaptchaCanvas,
  ) {}

  mark(x: number, y: number, order: number): void {
    const layer = this.layer;

    if (!layer) {
      return;
    }

    const badge = this.create(x, y, layer);
    badge.textContent = String(order);
    this.badges.push(badge);
  }

  markErrors(points: ClickPoint[]): void {
    const layer = this.layer;

    if (!layer) {
      return;
    }

    points.forEach((point, index) => {
      let badge = this.badges[index];

      if (!badge) {
        badge = this.create(point.x, point.y, layer);
        this.badges.push(badge);
      }

      badge.classList.remove('text-bg-primary');
      badge.classList.add(CLS.markerError, 'text-bg-danger');
      badge.textContent = '!';
      badge.title = `第 ${index + 1} 次点击不正确`;
    });
  }

  /** 淡出后清空，让用户看清上一轮点在了哪里。 */
  fadeOut(): void {
    const layer = this.layer;

    if (!layer || this.badges.length === 0) {
      return;
    }

    layer.classList.add(CLS.markerFading);
    this.clearFadeTimer();
    this.fadeTimer = window.setTimeout(() => {
      this.fadeTimer = null;
      this.clear();
    }, FADE_MS);
  }

  clear(): void {
    this.clearFadeTimer();
    this.layer?.classList.remove(CLS.markerFading);

    for (const badge of this.badges) {
      badge.remove();
    }

    this.badges.length = 0;
  }

  dispose(): void {
    this.clear();
  }

  private create(x: number, y: number, layer: HTMLElement): HTMLElement {
    const image = this.canvas.element;
    const badge = document.createElement('span');
    badge.className = `${CLS.marker} badge rounded-pill text-bg-primary d-flex align-items-center justify-content-center p-0`;
    badge.setAttribute('aria-hidden', 'true');

    if (image && image.width > 0 && image.height > 0) {
      badge.style.left = `${(x / image.width) * 100}%`;
      badge.style.top = `${(y / image.height) * 100}%`;
    }

    layer.append(badge);

    return badge;
  }

  private get layer(): HTMLElement | null {
    return this.dom.query(SEL.markerLayer);
  }

  private clearFadeTimer(): void {
    if (this.fadeTimer !== null) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
}
