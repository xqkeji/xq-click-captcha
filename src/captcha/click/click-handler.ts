import type { Dom } from '../core/dom';
import { SEL } from '../core/selectors';
import type { State } from '../core/state';
import type { ClickPoint } from '../core/types';
import { MarkerRenderer } from './marker-renderer';
import type { Ripple } from './ripple';

/** 画布边缘外的点击容差（图片像素）。 */
const EDGE_SLACK = 10;

/**
 * 点选验证码输入。坐标换算到图片像素后上报，
 * t 以首次点击为 0 点，与后端 ClickTimingValidator 的口径一致。
 */
export class ClickHandler {
  private points: ClickPoint[] = [];
  private start = 0;
  private listener: ((event: MouseEvent) => void) | null = null;

  constructor(
    private readonly dom: Dom,
    private readonly state: State,
    private readonly markers: MarkerRenderer,
    private readonly ripple: Ripple,
    private readonly onCommit: (points: ClickPoint[]) => void,
  ) {}

  get samples(): ClickPoint[] {
    return this.points;
  }

  attach(): void {
    const canvas = this.dom.query<HTMLCanvasElement>(SEL.image);

    if (!canvas || this.listener) {
      return;
    }

    this.listener = (event) => this.handle(event);
    canvas.addEventListener('click', this.listener);
  }

  detach(): void {
    const canvas = this.dom.query<HTMLCanvasElement>(SEL.image);

    if (canvas && this.listener) {
      canvas.removeEventListener('click', this.listener);
    }

    this.listener = null;
  }

  reset(): void {
    this.points = [];
    this.start = 0;
  }

  private handle(event: MouseEvent): void {
    if (this.state.type !== 'click' || this.state.busy || !this.state.imgLoaded) {
      return;
    }

    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const x = Math.round(((event.clientX - rect.left) * canvas.width) / rect.width);
    const y = Math.round(((event.clientY - rect.top) * canvas.height) / rect.height);
    const { imgWidth, imgHeight } = this.state;

    if (x < -EDGE_SLACK || x > imgWidth + EDGE_SLACK || y < -EDGE_SLACK || y > imgHeight + EDGE_SLACK) {
      return;
    }

    const safeX = Math.max(0, Math.min(x, imgWidth));
    const safeY = Math.max(0, Math.min(y, imgHeight));
    const now = Date.now();

    this.start ||= now;
    this.points.push({ x: safeX, y: safeY, t: now - this.start });

    this.markers.mark(safeX, safeY, this.points.length);
    this.ripple.at(event.clientX, event.clientY);

    if (this.points.length >= this.state.charCount) {
      this.state.busy = true;
      this.onCommit(this.points);
    }
  }
}