import { Component, JSX, Show, splitProps } from 'solid-js';

interface DialogProps {
  open?: boolean;
  title?: string;
  closeOnOverlayClick?: boolean;
  children?: JSX.Element;
  footer?: JSX.Element;
  onClose?: () => void;
  [key: string]: any;
}

const Dialog: Component<DialogProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'open',
    'title',
    'closeOnOverlayClick',
    'children',
    'footer',
    'onClose',
  ]);

  const isOpen = () => local.open ?? false;
  const closeOnOverlayClick = () => local.closeOnOverlayClick ?? true;

  const handleBackdropClick = () => {
    if (closeOnOverlayClick()) {
      local.onClose?.();
    }
  };

  return (
    <Show when={isOpen()}>
      <div
        {...rest}
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleBackdropClick}
      >
        <div
          class="min-w-[320px] max-w-[90vw] rounded-lg bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Show when={local.title}>
            <div class="mb-3 text-lg font-semibold text-gray-800">
              {local.title}
            </div>
          </Show>
          <div class="mb-4 text-gray-600">{local.children}</div>
          <Show when={local.footer}>
            <div class="flex justify-end gap-2">{local.footer}</div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default Dialog;
