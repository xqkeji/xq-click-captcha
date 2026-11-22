import type { Dom } from '../core/dom';
import { SEL } from '../core/selectors';

const OK_VISIBLE_MS = 3000;
const ERROR_VISIBLE_MS = 2000;
/** 与 Bootstrap `.fade` 的过渡时长一致。 */
const FADE_MS = 150;

/** 成功 / 失败反馈条，复用 Bootstrap alert。同一时刻只显示一条。 */
export class Message {
  private timers: number[] = [];

  constructor(private readonly dom: Dom) {}

  show(text: string, ok: boolean): void {
    this.clearTimers();

    const target = this.dom.query(ok ? SEL.msgOk : SEL.msgError);
    const other = this.dom.query(ok ? SEL.msgError : SEL.msgOk);

    if (other) {
      other.classList.remove('show');
      other.hidden = true;
    }

    if (!target) {
      return;
    }

    target.textContent = text;
    target.hidden = false;
    // 强制重排，保证连续两次 show 时 Bootstrap 的 fade 过渡也能重新播放。
    void target.offsetWidth;
    target.classList.add('show');

    this.timers.push(
      window.setTimeout(() => {
        target.classList.remove('show');
        this.timers.push(
          window.setTimeout(() => {
            target.hidden = true;
          }, FADE_MS),
        );
      }, ok ? OK_VISIBLE_MS : ERROR_VISIBLE_MS),
    );
  }

  hideOk(): void {
    const node = this.dom.query(SEL.msgOk);

    if (node) {
      node.classList.remove('show');
      node.hidden = true;
    }
  }

  dispose(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers = [];
  }
}
