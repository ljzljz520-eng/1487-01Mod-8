import type { StyleDependencyInfo } from '../registry/types';

export const STYLE_DEPENDENCIES: Record<string, StyleDependencyInfo> = {
  tailwind: {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description:
      'SolidJS 组件（如 <Button>、<Dialog>、<Table>）通过 Tailwind 工具类输出样式。',
    required: true,
    includeHint:
      '在宿主项目中安装并配置 Tailwind CSS，确保注入 @tailwind base / @tailwind components / @tailwind utilities。',
  },
};

export const buttonShadowStyles = `
:host { display: inline-block; }
:host button {
  font-family: inherit;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color .2s ease;
  padding: 8px 16px;
  font-size: 1rem;
  background: #2563eb;
  color: #fff;
}
:host button:hover:not([disabled]) { filter: brightness(.92); }
:host([variant="secondary"]) button { background: #4b5563; }
:host([variant="outline"]) button { background: transparent; border: 1px solid #9ca3af; color: #374151; }
:host([variant="ghost"]) button { background: transparent; color: #374151; }
:host([size="small"]) button { padding: 4px 12px; font-size: .875rem; }
:host([size="large"]) button { padding: 12px 24px; font-size: 1.125rem; }
:host([disabled]) button,
:host button[disabled] { opacity: .5; cursor: not-allowed; }
`;

export const dialogShadowStyles = `
:host { display: block; }
:host .sui-dialog-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
:host .sui-dialog {
  background: #fff; border-radius: 8px; padding: 1.5rem;
  min-width: 320px; max-width: 90vw;
  box-shadow: 0 10px 25px rgba(0, 0, 0, .2);
}
:host .sui-dialog-header { font-size: 1.125rem; font-weight: 600; margin-bottom: .75rem; }
:host .sui-dialog-body { margin-bottom: 1rem; color: #4b5563; }
:host .sui-dialog-footer { display: flex; justify-content: flex-end; gap: .5rem; }
`;

export const tableShadowStyles = `
:host { display: block; }
:host table { width: 100%; border-collapse: collapse; font-size: .875rem; }
:host th, :host td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
:host thead th { background: #f9fafb; font-weight: 600; }
:host tbody tr:hover { background: #f3f4f6; }
`;
