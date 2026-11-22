import type { Dom } from '../core/dom';
import { SEL } from '../core/selectors';
import type { Theme as ThemeName } from '../core/types';

/**
 * 主题走 Bootstrap 的 data-bs-theme 属性，不再自建色板变量。
 * Bootstrap 内核只识别 light / dark；auto 在 JS 侧用 matchMedia 解析成
 * 实际明暗后写入 data-bs-theme，并跟随系统偏好变化。
 */
export class Theme {
  private current: ThemeName = 'auto';
  private media: MediaQueryList | null = null;
  private readonly onSystemChange = (): void => {
    if (this.current === 'auto') {
      this.write(this.resolve());
    }
  };

  constructor(private readonly dom: Dom) {}

  apply(theme: ThemeName): void {
    this.current = theme || 'auto';

    if (this.current === 'auto') {
      this.media ??= window.matchMedia('(prefers-color-scheme: dark)');
      this.media.addEventListener('change', this.onSystemChange);
    } else {
      this.media?.removeEventListener('change', this.onSystemChange);
    }

    this.write(this.resolve());
  }

  dispose(): void {
    this.media?.removeEventListener('change', this.onSystemChange);
    this.media = null;
  }

  private resolve(): 'light' | 'dark' {
    if (this.current === 'light' || this.current === 'dark') {
      return this.current;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private write(resolved: 'light' | 'dark'): void {
    // 只写自己的弹窗，避免同页多个实例互相覆盖页面级主题。
    this.dom.queryGlobal(SEL.modal)?.setAttribute('data-bs-theme', resolved);
  }
}
