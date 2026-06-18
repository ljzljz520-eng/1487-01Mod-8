import type { Component } from 'solid-js';

export type ComponentLoader = () => Promise<
  { default: Component<any> } | Component<any>
>;

export interface CustomElementOptions {
  shadowStyles?: string[];
  observedAttributes?: string[];
  booleanAttributes?: string[];
  jsonAttributes?: string[];
}

export interface ComponentDefinition extends CustomElementOptions {
  tagName: string;
  loader: ComponentLoader;
  dependencies?: string[];
  solidStyleDependencies?: string[];
}

export interface StyleDependencyInfo {
  id: string;
  name: string;
  description: string;
  required: boolean;
  includeHint: string;
}
