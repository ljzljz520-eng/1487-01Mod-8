import { describe, it, expect, vi } from 'vitest';
import { render } from 'solid-js/web';
import Dialog from '../Dialog';

describe('Dialog Component', () => {
  it('renders nothing when closed', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <Dialog>content</Dialog>, container);

    expect(container.children.length).toBe(0);
    document.body.removeChild(container);
  });

  it('renders the dialog panel when open', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <Dialog open title="确认操作">
          正文内容
        </Dialog>
      ),
      container,
    );

    const backdrop = container.firstElementChild;
    expect(backdrop).toBeTruthy();
    const panel = backdrop?.firstElementChild;
    expect(panel).toBeTruthy();
    expect(panel?.textContent).toContain('确认操作');
    expect(panel?.textContent).toContain('正文内容');

    document.body.removeChild(container);
  });

  it('calls onClose when the overlay is clicked', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const onClose = vi.fn();
    render(
      () => (
        <Dialog open onClose={onClose}>
          正文
        </Dialog>
      ),
      container,
    );

    const backdrop = container.firstElementChild as HTMLElement;
    backdrop.click();
    expect(onClose).toHaveBeenCalledTimes(1);

    document.body.removeChild(container);
  });

  it('does not call onClose when clicking inside the panel', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const onClose = vi.fn();
    render(
      () => (
        <Dialog open onClose={onClose}>
          正文
        </Dialog>
      ),
      container,
    );

    const panel = container.firstElementChild?.firstElementChild as HTMLElement;
    panel.click();
    expect(onClose).not.toHaveBeenCalled();

    document.body.removeChild(container);
  });
});
