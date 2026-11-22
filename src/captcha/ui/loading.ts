import type { Dom } from '../core/dom';
import { CLS, SEL } from '../core/selectors';

/** 加载遮罩：Bootstrap spinner-border + 失败时的 alert，绝不自建转圈动画。 */
export class Loading {
  constructor(private readonly dom: Dom) {}

  show(): void {
    const node = this.element;

    if (!node) {
      return;
    }

    const spinner = document.createElement('div');
    spinner.className = 'spinner-border spinner-border-sm text-primary';
    spinner.setAttribute('role', 'status');

    const label = document.createElement('span');
    label.className = 'visually-hidden';
    label.textContent = '加载中...';
    spinner.append(label);

    node.replaceChildren(spinner);
    node.classList.remove(CLS.loadingError);
    node.hidden = false;
  }

  hide(): void {
    const node = this.element;

    if (!node) {
      return;
    }

    node.replaceChildren();
    node.classList.remove(CLS.loadingError);
    node.hidden = true;
  }

  fail(): void {
    const node = this.element;

    if (!node) {
      return;
    }

    const alert = document.createElement('div');
    alert.className = 'alert alert-danger py-2 small mb-0';
    alert.setAttribute('role', 'alert');
    alert.textContent = '加载失败，请刷新重试';

    node.replaceChildren(alert);
    node.classList.add(CLS.loadingError);
    node.hidden = false;
  }

  private get element(): HTMLElement | null {
    return this.dom.query(SEL.loading);
  }
}
