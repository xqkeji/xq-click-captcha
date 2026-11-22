import type { Dom } from '../core/dom';
import type { Options } from '../core/options';
import { SEL } from '../core/selectors';

/** 提示条：展示后端下发的待点字符顺序，缺省用配置的兜底文案。 */
export class Hint {
  constructor(
    private readonly dom: Dom,
    private readonly options: Options,
  ) {}

  forClick(hint: string | undefined): void {
    const node = this.dom.query(SEL.hint);

    if (!node) {
      return;
    }

    node.textContent = hint ?? this.options.hintText;
    node.hidden = false;
  }
}
