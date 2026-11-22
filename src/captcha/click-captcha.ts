import {
  BaseCaptcha,
  CaptchaBehaviour,
  type BaseOptions,
  type CaptchaData,
  type CaptchaHooks,
  type ClickPoint,
} from 'xq-captcha-core';
import { resolveOptions, type Options } from './core/options';
import { BOUND_ATTR, SEL } from './core/selectors';
import { ClickHandler } from './click/click-handler';
import { MarkerRenderer } from './click/marker-renderer';
import { Ripple } from './click/ripple';
import { CaptchaCanvas } from './render/canvas';
import { loadImage } from './render/image-loader';
import { Hint } from './ui/hint';
import { Loading } from './ui/loading';
import { buildModal } from './ui/template';

const HOOKS: CaptchaHooks = {
  logPrefix: 'xq-click-captcha',
  type: 'click',
  defaultOptions: resolveOptions({}),
  modalSelector: SEL.modal,
  contentSelector: SEL.content,
  shakeClass: 'xq-captcha-shake',
  messageSelectors: { msgOk: SEL.msgOk, msgError: SEL.msgError },
  triggerClasses: { ripple: 'xq-captcha-pulse', verified: 'xq-captcha-passed' },
  triggerSelector: SEL.trigger,
  useModalCloseHook: true,
};

/** 点选包的类型特有行为；共享 state/dom/options 由基类注入。 */
class ClickBehaviour extends CaptchaBehaviour {
  private canvas!: CaptchaCanvas;
  private markers!: MarkerRenderer;
  private ripple!: Ripple;
  private hint!: Hint;
  private loading!: Loading;
  private click: ClickHandler | null = null;

  protected override onContextReady(): void {
    this.canvas = new CaptchaCanvas(this.ctx.dom, this.ctx.state);
    this.markers = new MarkerRenderer(this.ctx.dom, this.canvas);
    this.ripple = new Ripple(this.ctx.dom);
    this.hint = new Hint(this.ctx.dom, this.ctx.options as Options);
    this.loading = new Loading(this.ctx.dom);
    this.click = new ClickHandler(this.ctx.dom, this.ctx.state, this.markers, this.ripple, (points) => {
      this.ctx.submit({ click_points: JSON.stringify(points) });
    });
  }

  buildModal(options: BaseOptions): HTMLElement {
    return buildModal(options as Options);
  }

  attachInteraction(): void {
    this.click?.attach();
  }

  detachInteraction(): void {
    this.click?.detach();
  }

  resetForShow(): void {
    this.click?.reset();
    this.markers.clear();
  }

  suspendInteraction(): void {
    // 点选没有进行中的拖动，无需挂起。
  }

  prepareRefresh(): void {
    this.click?.reset();
    this.markers.fadeOut();
    this.ripple.clear();
    this.canvas.setVisible(false);
    this.canvas.clear();
    this.loading.show();
  }

  async applyData(data: CaptchaData): Promise<void> {
    this.ctx.state.imgWidth = data.bg_width || 240;
    this.ctx.state.imgHeight = data.bg_height || 150;
    this.ctx.state.charCount = data.char_count || 4;
    this.hint.forClick(data.hint);

    this.canvas.resize(this.ctx.state.imgWidth, this.ctx.state.imgHeight);
    this.ctx.emitRefresh();

    try {
      const image = await loadImage(data.image_base64);
      this.canvas.setVisible(true);
      this.canvas.measure();
      this.canvas.drawBackground(image);
      this.markers.clear();
      this.ctx.state.imgLoaded = true;
      this.loading.hide();
    } catch (error) {
      console.error('xq-click-captcha: 验证码图片加载失败', error);
      this.loading.fail();
    }
  }

  markFailures(): void {
    this.markers.markErrors(this.click?.samples ?? []);
  }

  beforeFailRefresh(): void {
    this.click?.reset();
  }

  get samples(): ClickPoint[] {
    return this.click?.samples ?? [];
  }
}

/**
 * 文字点选验证码前端门面。
 * 公开 API 由 xq-captcha-core 的 BaseCaptcha 提供。
 */
export class ClickCaptcha extends BaseCaptcha {
  private readonly clickBehaviour: ClickBehaviour;

  constructor(options: Partial<Options> = {}) {
    const behaviour = new ClickBehaviour();
    super(behaviour, HOOKS, options);
    this.clickBehaviour = behaviour;
  }

  override init(options?: Partial<Options>): this {
    return super.init(options as Partial<BaseOptions>);
  }

  getClickPoints(): ClickPoint[] {
    return this.clickBehaviour.samples;
  }

  protected override bindTools(): void {
    this.bindButton(SEL.refresh, () => this.refresh(), BOUND_ATTR);
  }
}
