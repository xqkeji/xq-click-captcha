/**
 * 全部 DOM 选择器集中在此。
 * 唯一的公开触发选择器是 .xq-captcha；弹窗内部一律使用 xq-captcha-* 命名空间，
 * 结构基于 Bootstrap Modal，因此不自建遮罩、不接管 body 滚动。
 */

export const SEL = {
  /** 公开触发器，宿主页面上唯一需要约定的类名。 */
  trigger: '.xq-captcha',
  /** Bootstrap 模态框根节点（含 .modal / .fade）。 */
  modal: '#xq-captcha-modal',
  /** 模态框内容盒，抖动动画作用在这里，避开 Bootstrap 对 dialog 的 transform。 */
  content: '.xq-captcha-modal .modal-content',
  /** 图片画布。 */
  image: '.xq-captcha-image',
  /** 覆盖在画布上的标记层与序号徽标。 */
  markerLayer: '.xq-captcha-marker-layer',
  /** 加载遮罩。 */
  loading: '.xq-captcha-loading',
  /** 提示条（Bootstrap alert-primary）。 */
  hint: '.xq-captcha-hint',
  /** 成功 / 失败反馈条（Bootstrap alert）。 */
  msgError: '.xq-captcha-message--error',
  msgOk: '.xq-captcha-message--ok',
  /** 刷新按钮（Bootstrap btn）。 */
  refresh: '.xq-captcha-refresh',
} as const;

export const CLS = {
  /** 触发器上的呼吸点动画。 */
  triggerPulse: 'xq-captcha-pulse',
  /** 验证通过后挂在触发器上的状态类。 */
  passed: 'xq-captcha-passed',
  /** 模态内容盒的失败抖动。 */
  shake: 'xq-captcha-shake',
  /** 加载失败态。 */
  loadingError: 'xq-captcha-loading-error',
  /** 隐藏工具类：loading 带 d-flex，必须用 d-none 覆盖而非 hidden 属性。 */
  hidden: 'd-none',
  /** 点击处的扩散波纹。 */
  tapWave: 'xq-captcha-tap-wave',
  /** 单个序号 / 错误徽标。 */
  marker: 'xq-captcha-marker',
  markerError: 'xq-captcha-marker--error',
  /** 标记层淡出。 */
  markerFading: 'xq-captcha-marker-layer--fading',
} as const;

/** 标记「已绑定」的 dataset 键，对应属性 data-xq-captcha-bound。 */
export const BOUND_ATTR = 'xqCaptchaBound';

/** 宿主表单提交失败时派发的事件；仅当表单内含本组件才复位。 */
export const FORM_ERROR_EVENT = 'xq.form.error';
