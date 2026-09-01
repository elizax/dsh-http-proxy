# dsh-http-proxy

给 DeepSeek Harness（DSH）加「模型请求走代理、其它请求直连」的能力，**不修改任何 DSH 官方代码**。

本机访问不到大模型、但代理服务器能访问时，装上本插件并配好代理，DSH 就把所有模型 API 请求走代理发出；web 搜索、网页抓取、MCP 等其它请求仍走本机直连。

## 原理

插件在运行时把 `globalThis.fetch` 包一层（DSH 的 DeepSeek 适配器和 pi-ai 的 OpenAI/Anthropic SDK 都调用它），按**目标域名**决定走哪条路：

- 域名是模型 API 域名 → 走代理（`undici ProxyAgent`，支持 HTTP/SOCKS5）
- 其它域名 → 本机直连（原来的 fetch）

整个过程不改 DSH 源码；卸载后 `globalThis.fetch` 恢复原样，不残留任何东西。

## 安装（一条命令）

> **⚠️ 请用带版本号的命令安装**：pnpm ≥ 10 的 `minimumReleaseAge` 策略会暂时跳过刚发布的新版本，不带版本号安装可能解析到旧版（旧版不兼容新版 DSH，启动会报错）。**显式指定版本号可绕过该策略。**

```bash
dsh plugin --profile web add dsh-http-proxy@0.1.2
```

`web` 是 profile 名，换成你自己的 profile 名（如 `headless`）。

**想装最新版？** 先查最新版本号，把命令里的 `0.1.2` 换成它：

```bash
npm view dsh-http-proxy version
```

然后执行 `dsh plugin --profile web add dsh-http-proxy@<最新版本号>`。

**升级已装的插件**：用插件市场（dshmarket）的更新功能，或直接用新版本号重新执行上面的安装命令。装不上指定版本（比如镜像同步有延迟）时，稍等片刻重试即可。

**备选：从 GitHub 装源码版**（始终是最新代码，无需编译，但需要能访问 GitHub）：

```bash
dsh plugin --profile web add github:elizax/dsh-http-proxy
```

> **兼容性**：需要 DSH ≥ **0.1.2-alpha.2**（0.1.2 起客户端包做了拆分重组）。更早的 DSH 版本请改用本仓库更早的提交。

## 重启

```bash
dsh --profile web
```

## 配置

有两种方式，效果相同：

**方式 A：网页 UI（推荐）**

安装并重启后，打开 DSH 的 **设置 → 插件配置**，找到「HTTP 代理」卡片，填入代理地址，点保存。改完下一次请求生效，无需重启。卡片还支持「只代理这些域名」和「排除域名」，用于按需控制代理范围。

**方式 B：环境变量（不改文件，适合临时试用）**

```powershell
$env:DSH_HTTP_PROXY = 'socks5://127.0.0.1:7890'
```

环境变量只提供代理地址，等价于在 UI 里填「代理地址」；域名过滤沿用默认的自动识别。若两者同时设置，以 UI（settings）里的 `proxy` 为准。环境变量值不合法（如无效 URL 或不支持的协议）时插件**不会**启动失败，而是保持直连并在日志里提示。

### 配置字段

UI 卡片与底层配置一一对应：

- `proxy`（代理地址）：代理 URL，支持 `http:`、`https:`、`socks4:`、`socks4a:`、`socks5:`、`socks5h:`。留空则插件不生效。
- `proxyHosts`（只代理这些域名）：**留空 = 自动代理所有模型域名**；填写 = 只代理列出的这些域名。自动识别的模型域名包括：
  - `api.deepseek.com`（官方 DeepSeek 默认域名）
  - `DEEPSEEK_BASE_URL` 环境变量指向的域名（如果设置了）
  - `llm-pi-ai` 里配置的自定义网关域名（从 settings 自动读取）
- `excludeHosts`（排除域名）：永远不走代理的域名，优先级最高（即使被自动识别或列在 `proxyHosts` 里，也会被排除）。

## 卸载

```bash
dsh plugin --profile web remove dsh-http-proxy
dsh --profile web        # 重启生效
```

卸载后 DSH 完全恢复直连，不残留任何配置改动。

## 限制

- 按**域名**区分「模型请求」和「其它请求」。如果某个非模型操作恰好也访问模型 API 的域名（例如某些网关同时承载搜索和模型），它也会走代理。
- `transport: websocket` 的流式传输不经 `fetch`，不受影响（保持直连）。
- 不支持代理认证。

## 给开发者（改源码后重新构建）

改完 `src/` 后，重新构建并提交 `lib/`：

```bash
pnpm install
pnpm build      # 生成 lib/
git add lib/
git commit -m "build"
```

## License

MIT
