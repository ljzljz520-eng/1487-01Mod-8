import { describe, it, expect } from 'vitest';
import { render } from 'solid-js/web';
import Table, { type TableColumn } from '../Table';

const columns: TableColumn[] = [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
];
const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

describe('Table Component', () => {
  it('renders headers and rows', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <Table columns={columns} data={data} />, container);

    const ths = container.querySelectorAll('th');
    expect(ths.length).toBe(2);
    expect(ths[0].textContent).toBe('姓名');

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Alice');
    expect(rows[1].textContent).toContain('Bob');

    document.body.removeChild(container);
  });

  it('renders an empty state when there is no data', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <Table columns={columns} data={[]} />, container);

    expect(container.textContent).toContain('暂无数据');
    document.body.removeChild(container);
  });

  it('accepts JSON string props (custom element interop)', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <Table
          columns={JSON.stringify(columns)}
          data={JSON.stringify(data)}
        />
      ),
      container,
    );

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Alice');

    document.body.removeChild(container);
  });
});
