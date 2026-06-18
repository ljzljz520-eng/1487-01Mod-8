import { createComponent, type Component } from 'solid-js';
import { render } from 'solid-js/web';
import type { CustomElementOptions } from './types';

function injectShadowStyles(
  root: ShadowRoot,
  tagName: string,
  styles?: string[],
): void {
  if (!styles || styles.length === 0) return;

  const css = styles.join('\n');
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return;
  } catch {
    // 某些环境（如部分 jsdom 版本）不支持构造样式表，回退到 <style> 标签
  }

  if (root.querySelector(`style[data-sui="${tagName}"]`)) return;
  const style = document.createElement('style');
  style.setAttribute('data-sui', tagName);
  style.textContent = css;
  root.appendChild(style);
}

function coerceAttribute(
  name: string,
  value: string | null,
  options: CustomElementOptions,
): unknown {
  if (value === null) {
    return options.booleanAttributes?.includes(name) ? false : undefined;
  }
  if (options.jsonAttributes?.includes(name)) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (options.booleanAttributes?.includes(name)) {
    return value !== 'false';
  }
  return value;
}

export function defineSolidCustomElement(
  tagName: string,
  Comp: Component<any>,
  options: CustomElementOptions = {},
): void {
  if (customElements.get(tagName)) {
    return;
  }

  const observed = options.observedAttributes ?? [];

  class SolidUIElement extends HTMLElement {
    private dispose?: () => void;
    private root?: ShadowRoot;
    private props: Record<string, unknown> = {};

    static get observedAttributes(): string[] {
      return observed;
    }

    attributeChangedCallback(
      name: string,
      _old: string | null,
      value: string | null,
    ): void {
      this.props[name] = coerceAttribute(name, value, options);
    }

    connectedCallback(): void {
      if (this.root) return;
      this.root = this.attachShadow({ mode: 'open' });
      this.dispose = render(
        () => createComponent(Comp, { ...this.props }),
        this.root,
      );
      injectShadowStyles(this.root, tagName, options.shadowStyles);
    }

    disconnectedCallback(): void {
      this.dispose?.();
      this.dispose = undefined;
    }
  }

  customElements.define(tagName, SolidUIElement);
}
