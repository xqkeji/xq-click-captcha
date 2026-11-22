import Modal from 'bootstrap/js/dist/modal';
import type { Dom } from '../core/dom';
import { CLS, SEL } from '../core/selectors';
import type { CaptchaType } from '../core/types';

const SHAKE_MS = 500;

/**
 * 弹窗显隐完全委托给 Bootstrap 的 Modal 组件：
 * 遮罩、ESC / 背景点击关闭、焦点陷阱、body 滚动锁定都由它处理。
 * 这里只保留类型标记与失败抖动，以及区分「用户主动关闭」的回调。
 */
export class ModalHost {
  private instance: Modal | null = null;
  private shakeTimer: number | null = null;
  private hideHandler: (() => void) | null = null;
  private disposed = false;
  /** close() 置位，使 hide.bs.modal 能区分程序关闭与用户关闭。 */
  private programmatic = false;

  constructor(
    private readonly dom: Dom,
    private readonly onUserClose: () => void,
  ) {}

  get element(): HTMLElement | null {
    return this.dom.queryGlobal(SEL.modal);
  }

  open(): void {
    const element = this.element;

    if (!element) {
      return;
    }

    this.ensureInstance(element).show();
  }

  close(): void {
    const element = this.element;

    if (!element || !Modal.getInstance(element)) {
      return;
    }

    this.programmatic = true;
    this.instance?.hide();
  }

  setType(type: CaptchaType): void {
    this.element?.setAttribute('data-xq-captcha-type', type);
  }

  shake(): void {
    const content = this.dom.query(SEL.content);

    if (!content) {
      return;
    }

    content.classList.add(CLS.shake);
    this.clearShakeTimer();
    this.shakeTimer = window.setTimeout(() => {
      content.classList.remove(CLS.shake);
      this.shakeTimer = null;
    }, SHAKE_MS);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.clearShakeTimer();

    const element = this.element;

    if (!element) {
      this.instance = null;
      return;
    }

    const finalize = (): void => {
      // 必须在 Bootstrap 的隐藏过渡结束后再 dispose()，
      // 否则它排队的 _hideModal 回调会访问已置空的 _element。
      this.instance?.dispose();
      element.remove();
      this.instance = null;
      this.hideHandler = null;
    };

    if (this.instance && element.classList.contains('show')) {
      if (this.hideHandler) {
        element.removeEventListener('hide.bs.modal', this.hideHandler);
      }
      element.addEventListener('hidden.bs.modal', finalize, { once: true });
      this.instance.hide();
      // 过渡事件未触发时的兜底回收。
      window.setTimeout(() => {
        if (this.instance) {
          finalize();
        }
      }, 600);
    } else {
      finalize();
    }
  }

  private ensureInstance(element: HTMLElement): Modal {
    if (this.instance) {
      return this.instance;
    }

    this.instance = Modal.getOrCreateInstance(element);
    this.hideHandler = () => {
      if (!this.programmatic) {
        this.onUserClose();
      }
      this.programmatic = false;
    };
    element.addEventListener('hide.bs.modal', this.hideHandler);

    return this.instance;
  }

  private clearShakeTimer(): void {
    if (this.shakeTimer !== null) {
      clearTimeout(this.shakeTimer);
      this.shakeTimer = null;
    }
  }
}
