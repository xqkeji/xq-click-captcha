import {
  BASE_OPTIONS,
  createTransport as createCoreTransport,
  resolveOptions as resolveCoreOptions,
  type BaseOptions,
  type Transport,
} from 'xq-captcha-core';

/** 点选包特有配置：提示兜底文案。 */
export interface Options extends BaseOptions {
  hintText: string;
}

export const DEFAULT_OPTIONS: Options = {
  ...BASE_OPTIONS,
  hintText: '请依次点击指定字符',
};

export function resolveOptions(overrides: Partial<Options> = {}): Options {
  return resolveCoreOptions(DEFAULT_OPTIONS, overrides);
}

export function createTransport(options: Options): Transport {
  return createCoreTransport(options);
}

export type { Copyright } from 'xq-captcha-core';
