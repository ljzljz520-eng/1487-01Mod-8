export {
  defineComponent,
  register,
  registerAll,
  isRegistered,
  isDefined,
  listComponents,
  getStyleDependencies,
  STYLE_DEPENDENCIES,
} from './registry';

export { COMPONENT_TAGS } from './manifest';

export type {
  ComponentDefinition,
  ComponentLoader,
  CustomElementOptions,
  StyleDependencyInfo,
} from './types';
