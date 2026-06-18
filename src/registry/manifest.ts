import { defineComponent } from './registry';
import {
  buttonShadowStyles,
  dialogShadowStyles,
  tableShadowStyles,
} from '../styles';

defineComponent('button', {
  tagName: 'solid-button',
  loader: () => import('../components/Button'),
  solidStyleDependencies: ['tailwind'],
  shadowStyles: [buttonShadowStyles],
  observedAttributes: ['variant', 'size', 'disabled'],
  booleanAttributes: ['disabled'],
});

defineComponent('dialog', {
  tagName: 'solid-dialog',
  loader: () => import('../components/Dialog'),
  solidStyleDependencies: ['tailwind'],
  shadowStyles: [dialogShadowStyles],
  observedAttributes: ['open', 'title'],
  booleanAttributes: ['open'],
});

defineComponent('table', {
  tagName: 'solid-table',
  loader: () => import('../components/Table'),
  solidStyleDependencies: ['tailwind'],
  shadowStyles: [tableShadowStyles],
  observedAttributes: ['columns', 'data', 'row-key'],
  jsonAttributes: ['columns', 'data'],
});

export const COMPONENT_TAGS = {
  button: 'solid-button',
  dialog: 'solid-dialog',
  table: 'solid-table',
} as const;
