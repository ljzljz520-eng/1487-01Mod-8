import type { Component } from 'solid-js';
import { defineSolidCustomElement } from './createCustomElement';
import { STYLE_DEPENDENCIES } from '../styles';
import type {
  ComponentDefinition,
  StyleDependencyInfo,
} from './types';

const definitions = new Map<string, ComponentDefinition>();
const registered = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function defineComponent(
  name: string,
  definition: ComponentDefinition,
): boolean {
  if (definitions.has(name)) {
    return false;
  }
  definitions.set(name, definition);
  return true;
}

export function isDefined(name: string): boolean {
  return definitions.has(name);
}

export function isRegistered(name: string): boolean {
  const def = definitions.get(name);
  if (!def) return false;
  return (
    registered.has(def.tagName) || !!customElements.get(def.tagName)
  );
}

export function listComponents(): string[] {
  return [...definitions.keys()];
}

export async function register(name: string): Promise<void> {
  const def = definitions.get(name);
  if (!def) {
    throw new Error(`[solid-web-components-ui] 未知组件: "${name}"`);
  }

  if (isRegistered(name)) {
    return;
  }

  const existing = pending.get(def.tagName);
  if (existing) {
    return existing;
  }

  const task = (async () => {
    if (def.dependencies && def.dependencies.length > 0) {
      await Promise.all(def.dependencies.map((dep) => register(dep)));
    }

    const mod = await def.loader();
    const Comp = (mod as { default?: Component })?.default ?? (mod as Component);

    defineSolidCustomElement(def.tagName, Comp, {
      shadowStyles: def.shadowStyles,
      observedAttributes: def.observedAttributes,
      booleanAttributes: def.booleanAttributes,
      jsonAttributes: def.jsonAttributes,
    });

    registered.add(def.tagName);
  })();

  pending.set(def.tagName, task);
  try {
    await task;
  } finally {
    pending.delete(def.tagName);
  }
}

export function registerAll(names: string[]): Promise<void[]> {
  return Promise.all(names.map(register));
}

export function getStyleDependencies(
  name?: string,
): StyleDependencyInfo[] | Record<string, StyleDependencyInfo[]> {
  if (name) {
    const def = definitions.get(name);
    const ids = def?.solidStyleDependencies ?? [];
    return ids
      .map((id) => STYLE_DEPENDENCIES[id])
      .filter((info): info is StyleDependencyInfo => Boolean(info));
  }

  const result: Record<string, StyleDependencyInfo[]> = {};
  for (const [componentName, def] of definitions) {
    result[componentName] = (def.solidStyleDependencies ?? [])
      .map((id) => STYLE_DEPENDENCIES[id])
      .filter((info): info is StyleDependencyInfo => Boolean(info));
  }
  return result;
}

export { STYLE_DEPENDENCIES } from '../styles';
