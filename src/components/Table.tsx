import { Component, For, JSX, createMemo, splitProps } from 'solid-js';

export interface TableColumn {
  key: string;
  title: string;
  render?: (row: any, index: number) => JSX.Element;
}

interface TableProps {
  columns?: TableColumn[] | string;
  data?: any[] | string;
  [key: string]: any;
}

const normalizeArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const Table: Component<TableProps> = (props) => {
  const [local, rest] = splitProps(props, ['columns', 'data']);

  const columns = createMemo<TableColumn[]>(() => normalizeArray<TableColumn>(local.columns));
  const data = createMemo<any[]>(() => normalizeArray<any>(local.data));

  return (
    <div {...rest}>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <For each={columns()}>
              {(col) => (
                <th class="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                  {col.title}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For
            each={data()}
            fallback={
              <tr>
                <td
                  class="border border-gray-200 px-3 py-2 text-gray-400"
                  colspan={columns().length || 1}
                >
                  暂无数据
                </td>
              </tr>
            }
          >
            {(row, index) => (
              <tr class="hover:bg-gray-100">
                <For each={columns()}>
                  {(col) => (
                    <td class="border border-gray-200 px-3 py-2 text-gray-700">
                      {col.render ? col.render(row, index()) : row?.[col.key]}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
