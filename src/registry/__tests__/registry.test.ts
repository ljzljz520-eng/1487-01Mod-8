import { describe, it, expect, vi } from 'vitest';
import {
  defineComponent,
  register,
  registerAll,
  isRegistered,
  isDefined,
  listComponents,
  getStyleDependencies,
} from '../registry';

const noopComponent = () => null;

const defineMock = (
  name: string,
  tagName: string,
  overrides: {
    loader?: () => Promise<{ default: () => null }>;
    dependencies?: string[];
    styleDeps?: string[];
  } = {},
) => {
  defineComponent(name, {
    tagName,
    loader:
      overrides.loader ??
      vi.fn(async () => ({ default: noopComponent as () => null })),
    dependencies: overrides.dependencies,
    solidStyleDependencies: overrides.styleDeps ?? ['tailwind'],
    shadowStyles: ['body { color: red }'],
    observedAttributes: [],
  });
};

describe('Component registry', () => {
  it('registers lazily and guards against duplicate registration', async () => {
    const loader = vi.fn(async () => ({ default: noopComponent as () => null }));
    defineMock('lazy-dup', 'solid-lazy-dup', { loader });

    expect(isRegistered('lazy-dup')).toBe(false);

    await register('lazy-dup');
    expect(loader).toHaveBeenCalledTimes(1);
    expect(isRegistered('lazy-dup')).toBe(true);

    await register('lazy-dup');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('defines the custom element on the global registry', async () => {
    defineMock('defined-mock', 'solid-defined-mock');
    expect(customElements.get('solid-defined-mock')).toBeUndefined();

    await register('defined-mock');
    expect(typeof customElements.get('solid-defined-mock')).toBe('function');
  });

  it('registers multiple components via registerAll', async () => {
    const a = vi.fn(async () => ({ default: noopComponent as () => null }));
    const b = vi.fn(async () => ({ default: noopComponent as () => null }));
    defineMock('multi-a', 'solid-multi-a', { loader: a });
    defineMock('multi-b', 'solid-multi-b', { loader: b });

    await registerAll(['multi-a', 'multi-b']);

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(isRegistered('multi-a')).toBe(true);
    expect(isRegistered('multi-b')).toBe(true);
  });

  it('loads component dependencies before the component itself', async () => {
    const order: string[] = [];
    defineComponent('dep-base', {
      tagName: 'solid-dep-base',
      loader: async () => {
        order.push('base');
        return { default: noopComponent as () => null };
      },
      solidStyleDependencies: ['tailwind'],
      shadowStyles: [],
      observedAttributes: [],
    });
    defineComponent('dep-child', {
      tagName: 'solid-dep-child',
      loader: async () => {
        order.push('child');
        return { default: noopComponent as () => null };
      },
      dependencies: ['dep-base'],
      solidStyleDependencies: ['tailwind'],
      shadowStyles: [],
      observedAttributes: [],
    });

    await register('dep-child');

    expect(order).toEqual(['base', 'child']);
  });

  it('deduplicates concurrent registrations of the same component', async () => {
    const loader = vi.fn(async () => ({ default: noopComponent as () => null }));
    defineMock('concurrent', 'solid-concurrent', { loader });

    await Promise.all([
      register('concurrent'),
      register('concurrent'),
      register('concurrent'),
    ]);

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('throws when registering an unknown component', async () => {
    await expect(register('does-not-exist')).rejects.toThrow();
  });

  it('defineComponent guards against duplicate definitions', () => {
    const first = defineComponent('dup-def', {
      tagName: 'solid-dup-def',
      loader: async () => ({ default: noopComponent as () => null }),
      solidStyleDependencies: [],
      shadowStyles: [],
      observedAttributes: [],
    });
    const second = defineComponent('dup-def', {
      tagName: 'solid-dup-def-2',
      loader: async () => ({ default: noopComponent as () => null }),
      solidStyleDependencies: [],
      shadowStyles: [],
      observedAttributes: [],
    });

    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it('reports definitions via isDefined and listComponents', () => {
    defineMock('list-mock', 'solid-list-mock');

    expect(isDefined('list-mock')).toBe(true);
    expect(isDefined('nope')).toBe(false);
    expect(listComponents()).toContain('list-mock');
  });

  it('returns style dependencies for a component and for all components', () => {
    defineMock('style-mock', 'solid-style-mock', { styleDeps: ['tailwind'] });

    const deps = getStyleDependencies('style-mock') as { id: string }[];
    expect(deps.length).toBe(1);
    expect(deps[0].id).toBe('tailwind');

    const all = getStyleDependencies() as Record<string, { id: string }[]>;
    expect(all['style-mock'].length).toBe(1);
    expect(all['style-mock'][0].id).toBe('tailwind');
  });
});
