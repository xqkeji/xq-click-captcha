export { ClickCaptcha } from './click-captcha';
export { DEFAULT_OPTIONS, resolveOptions } from './core/options';
export type { Copyright, Options } from './core/options';
export { FetchTransport, HttpError } from './core/http';
export type { HttpMethod, Transport } from './core/http';
export type {
  CallbackMap,
  CallbackName,
  CaptchaData,
  CaptchaType,
  CheckResult,
  ClickPoint,
  Theme,
  TrackPoint,
} from './core/types';

import { ClickCaptcha } from './click-captcha';

/** 页面级默认实例。弹窗 DOM 是单例，一个页面共用它即可。 */
export const clickCaptcha = new ClickCaptcha();

declare global {
  interface Window {
    xqClickCaptcha?: ClickCaptcha;
  }
}

/** 显式挂到 window，供不用模块打包器的宿主页面直接取用。 */
export function installGlobal(instance: ClickCaptcha = clickCaptcha): ClickCaptcha {
  window.xqClickCaptcha = instance;
  return instance;
}