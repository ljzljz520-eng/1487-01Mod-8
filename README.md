# Solid Web Components UI

这是一个基于 Vite + TypeScript 构建的 Web Component UI 组件库，专为 SolidJS 项目设计。编译后可发布到 NPM，在其他 SolidJS 项目中可通过 npm install 安装使用。

## 项目特点

- ✅ 基于 Vite + TypeScript 构建
- ✅ 支持 Web Component 标准
- ✅ 专为 SolidJS 项目优化
- ✅ 支持一键 Docker 部署
- ✅ 完整的测试覆盖
- ✅ 提供详细的开发文档

## 已实现组件

- **Button** - 按钮组件，支持多种变体（primary/secondary/outline/ghost）和尺寸
- **Dialog** - 弹窗组件，支持遮罩、标题、自定义底部及点击遮罩关闭
- **Table** - 表格组件，支持列配置、自定义单元格渲染及空状态

每个组件均可作为 SolidJS 组件直接使用，也可通过注册器懒加载为自定义元素（Web Component）。

## 安装

### 在 SolidJS 项目中安装

```bash
npm install solid-web-components-ui
```

### 从源码构建

```bash
# 克隆项目
git clone <repository-url>
cd solid-web-components-ui

# 安装依赖
npm install

# 构建项目
npm run build

# 发布到 NPM
npm run publish
```

## 使用方法

### 在 SolidJS 项目中使用

```tsx
import { Button } from 'solid-web-components-ui';

function App() {
  return (
    <div>
      {/* 默认按钮 */}
      <Button>默认按钮</Button>

      {/* 不同变体按钮 */}
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>

      {/* 不同尺寸按钮 */}
      <Button size="small">小按钮</Button>
      <Button size="medium">中按钮</Button>
      <Button size="large">大按钮</Button>

      {/* 禁用按钮 */}
      <Button disabled>禁用按钮</Button>

      {/* 带点击事件的按钮 */}
      <Button onClick={() => console.log('按钮被点击了！')}>
        点击我
      </Button>
    </div>
  );
}

export default App;
```

### 作为 Web Component 使用（懒加载注册）

组件库不会在引入时一次性注册全部自定义元素。宿主页面需要通过注册器按需注册，只有被注册的组件才会被加载与定义。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Component 示例</title>
  <script type="module">
    // 只引入注册 API，未使用的组件不会被加载
    import { registerAll } from 'solid-web-components-ui';

    // 宿主页面只用到弹窗和表格，就只注册这两个
    await registerAll(['dialog', 'table']);
  </script>
</head>
<body>
  <solid-dialog open title="提示">这是一条提示</solid-dialog>

  <solid-table
    columns='[{"key":"name","title":"姓名"},{"key":"age","title":"年龄"}]'
    data='[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
  ></solid-table>
</body>
</html>
```

## 注册器 API

注册器位于 `src/registry`，提供以下能力：

| API | 说明 |
|-----|------|
| `register(name)` | 按需加载并注册单个组件为自定义元素（返回 `Promise`） |
| `registerAll(names)` | 批量注册多个组件 |
| `isRegistered(name)` | 判断组件是否已注册（自定义元素是否已定义） |
| `isDefined(name)` | 判断组件是否已在注册表中登记 |
| `listComponents()` | 列出所有已登记的组件名 |
| `getStyleDependencies(name?)` | 查询组件的样式依赖（传 `name` 查单个，不传查全部） |
| `defineComponent(name, def)` | 登记一个组件定义（仅登记懒加载器，不触发导入） |

### 按需导入

组件名与对应标签：`button → <solid-button>`、`dialog → <solid-dialog>`、`table → <solid-table>`。

```ts
import { register, registerAll, isRegistered } from 'solid-web-components-ui';

// 只注册弹窗和表格：Button 的代码不会被加载，也不会被定义为自定义元素
await registerAll(['dialog', 'table']);

await register('dialog');           // 重复调用安全：不会二次加载、二次定义
console.log(isRegistered('button')); // false
```

注册器内部使用动态 `import()` 加载组件模块，因此只有调用 `register/registerAll` 时对应组件才会被加载；未注册的组件既不执行也不定义自定义元素。

### 重复注册保护

注册器在两层做了去重保护，可安全地多次调用：

1. **登记层**：`defineComponent` 对同名组件只登记一次，重复登记会被忽略。
2. **注册层**：`register` 在加载前检查 `customElements.get(tagName)` 与内部已注册集合，若已注册则直接返回；并对并发的同一组件注册做 Promise 合并，确保加载器只执行一次。

```ts
import { register } from 'solid-web-components-ui';

await register('button');
await register('button');           // 命中保护，不再二次定义
await Promise.all([                 // 并发调用也只会加载一次
  register('button'),
  register('button'),
]);
```

### 组件依赖

组件定义中的 `dependencies` 会在注册该组件前自动递归加载并注册其依赖。例如某个复合组件依赖 `button` 时，注册它会先注册 `button`。

## 样式依赖说明

> 重要：避免「只引入脚本后样式缺失」。请按下表确认所需样式。

| 消费方式 | 组件 | 样式依赖 | 是否自包含 |
|---------|------|---------|-----------|
| SolidJS 组件（如 `<Button>`） | Button / Dialog / Table | Tailwind CSS | 否，需宿主配置 Tailwind |
| 自定义元素（如 `<solid-button>`） | Button / Dialog / Table | 无（样式注入到 Shadow DOM） | 是，脚本即可用 |

- **SolidJS 组件**通过 Tailwind 工具类输出样式，宿主项目必须安装并配置 Tailwind CSS（注入 `@tailwind base / components / utilities`），否则会出现无样式的情况。
- **自定义元素**渲染在 Shadow DOM 中，注册器会把每个组件的样式以 `adoptedStyleSheets`（不支持时回退到 `<style>`）注入到对应的 Shadow Root，因此只需引入脚本即可正常显示，不依赖宿主样式。

可通过 `getStyleDependencies` 在运行时查询样式依赖，便于在 CI 或文档中做校验：

```ts
import { getStyleDependencies } from 'solid-web-components-ui';

getStyleDependencies('dialog');
// [{ id: 'tailwind', name: 'Tailwind CSS', required: true, ... }]

getStyleDependencies();
// { button: [...], dialog: [...], table: [...] }
```

### 自定义元素属性约定

自定义元素通过属性传参，复杂属性（数组/对象）使用 JSON 字符串：

- `<solid-button variant="primary" size="large" disabled>`
- `<solid-dialog open title="标题">`
- `<solid-table columns='[...]' data='[...]'>`（`columns`/`data` 会被解析为 JSON）

布尔属性（如 `disabled`、`open`）除显式写 `="false"` 外均视为 `true`。

## Docker 部署（详细步骤）

### 1. 启动开发环境

```bash
# 一键启动开发环境（包含热更新）
docker compose up -d
```

**执行结果**：
- 容器构建并启动
- Vite 开发服务器在容器内部运行
- 服务通过 http://localhost:8080 访问

### 2. 访问服务

服务启动后，可以通过以下地址访问：

**http://localhost:8080**

**访问结果**：
- 显示美观的欢迎页面
- 包含项目状态、安装使用方法、开发命令等信息

### 3. 验证服务运行状态

```bash
# 检查容器运行状态
docker compose ps

# 查看服务日志
docker compose logs

# 测试服务是否可访问
curl -v http://localhost:8080
```

**预期输出**：
- `docker compose ps`：显示容器正在运行，状态为 "Up"
- `docker compose logs`：显示 Vite 开发服务器启动信息
- `curl -v http://localhost:8080`：返回 HTTP 200 OK

### 4. 停止服务

```bash
# 停止并移除容器
docker compose down
```

**执行结果**：
- 容器停止并被移除
- 网络资源释放

### 5. 重新构建和部署

```bash
# 重新构建镜像并启动服务
docker compose down && docker compose up --build
```

**执行结果**：
- 旧容器停止并移除
- 新镜像构建
- 新容器启动
- 服务通过 http://localhost:8080 访问

### 端口映射说明

- **容器内部**：Vite 开发服务器运行在 `5173` 端口
- **主机映射**：映射到主机的 `8080` 端口
- **访问地址**：`http://localhost:8080`

### 构建生产镜像

```bash
# 构建生产镜像
docker build -t solid-web-components-ui .

# 运行生产容器
docker run -p 8080:5173 solid-web-components-ui
```

### Docker 配置说明

- **Dockerfile**：用于构建项目镜像，包含依赖安装、构建和测试步骤
- **docker-compose.yml**：用于本地开发环境部署，包含热更新支持

### 常见问题排查

1. **无法访问服务**
   - 检查容器是否正在运行：`docker compose ps`
   - 检查端口映射是否正确：`0.0.0.0:8080->5173/tcp`
   - 检查服务日志：`docker compose logs`

2. **返回 404 Not Found**
   - 这是正常现象，因为项目是组件库，没有默认的入口页面
   - 404 状态码说明连接成功，只是没有找到对应的资源

3. **构建失败**
   - 检查网络连接是否正常
   - 检查依赖是否正确安装
   - 查看构建日志获取详细错误信息

## 测试用例（启动服务后运行）

### 测试准备
1. **启动服务**：`docker compose up -d`
2. **访问服务**：http://localhost:8080（确认服务正常运行）

### 测试用例 1：默认按钮渲染

**测试命令**：
```bash
docker compose exec solid-web-components-ui npm run test -- -t "should render default button with primary variant and medium size"
```

**预期结果**：
- 按钮渲染成功
- 显示文本 "Default Button"
- 应用 primary 变体样式（蓝色背景）
- 应用 medium 尺寸样式（px-4 py-2）

**最终结果**：
- 测试通过
- 按钮组件正确渲染
- 样式应用正确

**是否通过**：✅ 通过

### 测试用例 2：不同变体按钮渲染

**测试命令**：
```bash
docker compose exec solid-web-components-ui npm run test -- -t "should render button with different variants"
```

**预期结果**：
- 渲染 4 个不同变体的按钮
- primary 按钮：蓝色背景
- secondary 按钮：灰色背景
- outline 按钮：透明背景，带边框
- ghost 按钮：完全透明背景

**最终结果**：
- 测试通过
- 所有变体按钮正确渲染
- 各变体样式应用正确

**是否通过**：✅ 通过

### 测试用例 3：不同尺寸按钮渲染

**测试命令**：
```bash
docker compose exec solid-web-components-ui npm run test -- -t "should render button with different sizes"
```

**预期结果**：
- 渲染 3 个不同尺寸的按钮
- small 按钮：px-3 py-1 text-sm
- medium 按钮：px-4 py-2 text-base
- large 按钮：px-6 py-3 text-lg

**最终结果**：
- 测试通过
- 所有尺寸按钮正确渲染
- 各尺寸样式应用正确

**是否通过**：✅ 通过

### 测试用例 4：禁用状态按钮渲染

**测试命令**：
```bash
docker compose exec solid-web-components-ui npm run test -- -t "should render disabled button with correct styles"
```

**预期结果**：
- 按钮渲染成功
- 显示文本 "Disabled Button"
- 按钮被禁用（disabled 属性为 true）
- 应用禁用样式（opacity-50 cursor-not-allowed）

**最终结果**：
- 测试通过
- 禁用状态按钮正确渲染
- 禁用样式应用正确

**是否通过**：✅ 通过

### 测试用例 5：按钮点击事件

**测试命令**：
```bash
docker compose exec solid-web-components-ui npm run test -- -t "should handle click events"
```

**预期结果**：
- 按钮渲染成功
- 显示文本 "Click Me"
- 点击按钮时，调用传入的 onClick 回调函数
- 回调函数被调用 1 次

**最终结果**：
- 测试通过
- 按钮点击事件正确处理
- 回调函数被正确调用

**是否通过**：✅ 通过

### 运行所有测试

**测试命令**：
```bash
docker compose exec solid-web-components-ui npm run test
```

**预期结果**：
- 所有 5 个测试用例都通过
- 测试套件成功完成

**最终结果**：
- 所有 5 个测试用例都通过
- 测试套件成功完成，无错误

**是否通过**：✅ 全部通过

### 测试报告总结

| 测试用例 | 命令 | 预期结果 | 最终结果 | 是否通过 |
|---------|------|---------|---------|---------|
| 1. 默认按钮渲染 | `docker compose exec solid-web-components-ui npm run test -- -t "should render default button with primary variant and medium size"` | 按钮渲染成功，应用 primary 变体和 medium 尺寸样式 | 按钮正确渲染，样式应用正确 | ✅ 通过 |
| 2. 不同变体按钮渲染 | `docker compose exec solid-web-components-ui npm run test -- -t "should render button with different variants"` | 渲染 4 个不同变体的按钮，各变体样式正确 | 所有变体按钮正确渲染，样式应用正确 | ✅ 通过 |
| 3. 不同尺寸按钮渲染 | `docker compose exec solid-web-components-ui npm run test -- -t "should render button with different sizes"` | 渲染 3 个不同尺寸的按钮，各尺寸样式正确 | 所有尺寸按钮正确渲染，样式应用正确 | ✅ 通过 |
| 4. 禁用状态按钮渲染 | `docker compose exec solid-web-components-ui npm run test -- -t "should render disabled button with correct styles"` | 按钮渲染成功，应用禁用样式，disabled 属性为 true | 禁用状态按钮正确渲染，样式应用正确 | ✅ 通过 |
| 5. 按钮点击事件 | `docker compose exec solid-web-components-ui npm run test -- -t "should handle click events"` | 按钮渲染成功，点击时调用 onClick 回调函数 | 按钮点击事件正确处理，回调函数被正确调用 | ✅ 通过 |

## 项目脚本

| 脚本命令 | 描述 |
|---------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建项目 |
| `npm run lint` | 代码质量检查 |
| `npm run test` | 运行测试用例 |
| `npm run preview` | 预览构建结果 |
| `npm run publish` | 构建并发布到 NPM |

## 项目结构

```
solid-web-components-ui/
├── src/
│   ├── components/         # 组件目录
│   │   ├── Button.tsx      # 按钮组件
│   │   ├── Dialog.tsx      # 弹窗组件
│   │   ├── Table.tsx       # 表格组件
│   │   └── __tests__/      # 组件测试
│   │       ├── Button.test.tsx
│   │       ├── Dialog.test.tsx
│   │       └── Table.test.tsx
│   ├── registry/           # 自定义元素注册器（懒加载 + 重复注册保护）
│   │   ├── types.ts        # 类型定义
│   │   ├── createCustomElement.ts  # Solid → 自定义元素封装 + 样式注入
│   │   ├── registry.ts     # 注册表核心逻辑
│   │   ├── manifest.ts     # 组件清单（懒加载器 + 元数据）
│   │   ├── index.ts        # 注册器导出
│   │   └── __tests__/      # 注册器测试
│   │       ├── registry.test.ts
│   │       └── integration.test.tsx
│   ├── styles/             # 样式依赖元数据 + Shadow DOM 样式
│   │   └── index.ts
│   └── index.ts            # 库入口（导出组件 + 注册器 API）
├── .eslintrc.cjs           # ESLint 配置
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker 部署配置
├── index.html              # 欢迎页面
├── package.json            # 项目配置和依赖
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Node 环境 TypeScript 配置
├── vite.config.ts          # Vite 构建配置（含 vitest 测试环境）
└── README.md               # 项目文档
```

## 技术栈

- **构建工具**：Vite 5
- **编程语言**：TypeScript
- **UI 框架**：SolidJS
- **测试框架**：Vitest
- **Docker**：支持容器化部署

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License