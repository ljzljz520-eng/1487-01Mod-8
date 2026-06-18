import { describe, it, expect } from 'vitest';
import {
  register,
  registerAll,
  isRegistered,
  getStyleDependencies,
} from '../../index';

describe('integration: lazy registration of real components', () => {
  it('registers dialog and table on demand without registering button', async () => {
    await registerAll(['dialog', 'table']);

    expect(isRegistered('dialog')).toBe(true);
    expect(isRegistered('table')).toBe(true);
    expect(isRegistered('button')).toBe(false);
    expect(customElements.get('solid-button')).toBeUndefined();
    expect(typeof customElements.get('solid-dialog')).toBe('function');
    expect(typeof customElements.get('solid-table')).toBe('function');
  });

  it('injects shadow styles so the custom element is self-contained', async () => {
    await register('dialog');
    const el = document.createElement('solid-dialog');
    document.body.appendChild(el);
    await Promise.resolve();

    expect(el.shadowRoot).toBeTruthy();
    const hasStyleTag = !!el.shadowRoot?.querySelector(
      'style[data-sui="solid-dialog"]',
    );
    const hasAdoptedSheet =
      (el.shadowRoot?.adoptedStyleSheets?.length ?? 0) > 0;
    expect(hasStyleTag || hasAdoptedSheet).toBe(true);

    document.body.removeChild(el);
  });

  it('exposes style dependency metadata', () => {
    const deps = getStyleDependencies('dialog') as { id: string }[];
    expect(deps.some((d) => d.id === 'tailwind')).toBe(true);
  });
});
