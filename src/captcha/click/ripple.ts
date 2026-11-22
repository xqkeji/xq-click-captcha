import type { Dom } from '../core/dom';
import { CLS, SEL } from '../core/selectors';

/** 点击处的一次性扩散波纹。定位以画布舞台为基准，尺寸与动画都在样式表里。 */
export class Ripple {
  constructor(private readonly dom: Dom) {}

  at(clientX: number, clientY: number): void {
    const stage = this.dom.query(SEL.markerLayer)?.parentElement;

    if (!stage) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    const node = document.createElement('div');
    node.className = CLS.tapWave;
    node.style.left = `${clientX - rect.left}px`;
    node.style.top = `${clientY - rect.top}px`;

    node.addEventListener('animationend', () => node.remove(), { once: true });
    stage.append(node);
  }

  /** 换图时清掉残留：弹窗隐藏会中断动画，animationend 不一定触发。 */
  clear(): void {
    for (const node of this.dom.queryAll(`.${CLS.tapWave}`)) {
      node.remove();
    }
  }
}
