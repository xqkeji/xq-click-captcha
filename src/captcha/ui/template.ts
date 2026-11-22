import type { Options } from '../core/options';
import { SEL } from '../core/selectors';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  attrs: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, value);
  }

  return node;
}

/**
 * 弹窗结构完全采用 Bootstrap 5 的 Modal 标记：
 * .modal > .modal-dialog > .modal-content > header/body/footer。
 * 遮罩、焦点陷阱、ESC 关闭与 body 滚动锁定都由 Bootstrap Modal JS 负责。
 *
 * 所有文案走 textContent / setAttribute，不拼 innerHTML，
 * 避免宿主配置或后端下发内容被当成标记执行。
 */
export function buildModal(options: Options): HTMLElement {
  const existing = document.querySelector<HTMLElement>(SEL.modal);

  if (existing) {
    return existing;
  }

  const modal = el('div', 'modal fade xq-captcha-modal', {
    id: 'xq-captcha-modal',
    'data-xq-captcha-kind': 'click',
    tabindex: '-1',
    'aria-labelledby': 'xq-captcha-modal-title',
    'aria-hidden': 'true',
  });

  const dialog = el('div', 'modal-dialog modal-dialog-centered');
  const content = el('div', 'modal-content');

  // header：标题 + Bootstrap 原生关闭按钮（data-bs-dismiss 交给 Modal JS 处理）。
  const header = el('div', 'modal-header');
  const title = el('h5', 'modal-title h6', { id: 'xq-captcha-modal-title' });
  title.textContent = '安全验证';
  header.append(title);

  if (options.showClose) {
    header.append(
      el('button', 'btn-close', {
        type: 'button',
        'data-bs-dismiss': 'modal',
        'aria-label': '关闭',
      }),
    );
  }

  content.append(header);

  // body：画布舞台 + 提示条 + 反馈条。
  const body = el('div', 'modal-body');

  const stage = el('div', 'xq-captcha-stage position-relative w-100');

  const loading = el(
    'div',
    'xq-captcha-loading position-absolute top-0 start-0 w-100 h-100 z-3 d-flex align-items-center justify-content-center rounded',
    { role: 'status' },
  );
  loading.hidden = true;

  const image = el('canvas', 'xq-captcha-image d-block w-100 h-auto rounded', {
    width: '240',
    height: '150',
    'aria-label': '验证码图片',
  });

  // 标记层与画布同尺寸同位置：徽标用百分比定位，天然跟随画布缩放。
  const markerLayer = el('div', 'xq-captcha-marker-layer position-absolute top-0 start-0 w-100 h-100 pe-none', {
    'aria-hidden': 'true',
  });

  stage.append(loading, image, markerLayer);
  body.append(stage);

  const hint = el('div', 'alert alert-primary xq-captcha-hint small text-center mt-2 mb-0', { role: 'status' });
  hint.textContent = options.hintText;
  body.append(hint);

  const error = el(
    'div',
    'alert alert-danger fade xq-captcha-message xq-captcha-message--error small text-center mt-2 mb-0',
    { role: 'alert' },
  );
  error.hidden = true;

  const ok = el(
    'div',
    'alert alert-success fade xq-captcha-message xq-captcha-message--ok small text-center mt-2 mb-0',
    { role: 'status' },
  );
  ok.hidden = true;

  body.append(error, ok);
  content.append(body);

  // footer：版权 + Bootstrap 刷新按钮。
  const footer = el('div', 'modal-footer xq-captcha-footer');

  const copyright = el('a', 'xq-captcha-copyright me-auto text-secondary small text-decoration-none', {
    href: options.copyright.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    title: options.copyright.title,
  });
  copyright.textContent = options.copyright.text;
  footer.append(copyright);

  if (options.showRefresh) {
    const refresh = el('button', 'btn btn-sm btn-outline-secondary xq-captcha-refresh', {
      type: 'button',
      title: '刷新',
      'aria-label': '刷新验证码',
    });
    refresh.textContent = '↻';
    footer.append(refresh);
  }

  content.append(footer);

  dialog.append(content);
  modal.append(dialog);
  document.body.append(modal);

  return modal;
}
