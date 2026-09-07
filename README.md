# dsh-http-proxy

给 DeepSeek Harness（DSH）加「模型请求走代理、其它请求直连」的能力，**不修改任何 DSH 官方代码**。

本机访问不到大模型、但代理服务器能访问时，装上本插件并配好代理，DSH 就把所有模型 API 请求走代理发出；web 搜索、网页抓取、MCP 等其它请求仍走本机直连。

## 功能

- 按域名路由：模型 API 域名走代理，其它域名直连；卸载后完全恢复原状，不残留任何东西
- 代理支持 `http` / `https` / `socks4` / `socks4a` / `socks5` / `socks5h`
- 自动识别模型域名（`proxyHosts` 留空时）：
  - `api.deepseek.com`（官方 DeepSeek 默认域名）
  - `DEEPSEEK_BASE_URL` 环境变量指向的域名
  - `llm-pi-ai` 里配置的自定义网关域名
  - pi-ai 内置 provider 的默认端点（openai、anthropic、google、google-vertex、mistral、groq 等）——provider 没手写 `baseURL` 也会被自动代理
- 域名条目支持普通域名、`域名:端口`、完整 URL，以及 `.域名` / `*.域名` 后缀条目（`.example.com` 同时匹配 `example.com` 和它的所有子域；Vertex、Azure 这类区域化端点用它最方便）
- 设置页 UI 改完下一次请求即生效，无需重启

## 安装

> ⚠️ **请用带版本号的命令安装**：pnpm ≥ 10 的 `minimumReleaseAge` 策略会暂时跳过刚发布的新版本，不带版本号安装可能解析到旧版。**显式指定版本号可绕过该策略。**

```bash
dsh plugin --profile web add dsh-http-proxy@0.1.3
```

> `web` 是 profile 名，换成你自己的 profile 名（如 `headless`）；下文重启与卸载命令里的 profile 名要与此保持一致。

**想装最新版？** 先查最新版本号，把命令里的版本号换掉：

```bash
npm view dsh-http-proxy version
```

**从 GitHub 装源码版**（始终最新代码，无需编译，需要能访问 GitHub）：

```bash
dsh plugin --profile web add github:elizax/dsh-http-proxy
```

> **兼容性**：需要 DSH ≥ 0.1.2-alpha.2（0.1.2 起客户端包做了拆分重组）。更早的 DSH 版本请改用本仓库更早的提交。

**升级已装的插件**：用插件市场（dshmarket）的更新功能，或直接用新版本号重新执行上面的安装命令。装不上指定版本（比如镜像同步有延迟）时，稍等片刻重试即可。

## 重启

```bash
dsh --profile web
```

## 配置

两种方式效果相同；若同时设置，以 UI（settings）里的 `proxy` 为准。

**方式 A：网页 UI（推荐）**

打开 DSH 的**设置 → 插件配置**，找到「HTTP 代理」卡片，填入代理地址，点保存。改完下一次请求生效。卡片还支持「只代理这些域名」和「排除域名」，用于按需控制代理范围。

**方式 B：环境变量（不改文件，适合临时试用）**

```powershell
$env:DSH_HTTP_PROXY = 'socks5://127.0.0.1:7890'
```

环境变量只提供代理地址，等价于 UI 里的「代理地址」；域名过滤沿用默认的自动识别。值不合法（无效 URL 或不支持的协议）时插件**不会**启动失败，而是保持直连并在日志里提示。

### 配置字段

| 字段 | 含义 |
| --- | --- |
| `proxy` | 代理 URL（`http` / `https` / `socks4` / `socks4a` / `socks5` / `socks5h`）。留空则插件不生效 |
| `proxyHosts` | 只代理这些域名。**留空 = 自动代理所有模型域名**；填写 = 只代理列出的这些域名 |
| `excludeHosts` | 排除域名：永远不走代理，优先级最高（即使被自动识别或列在 `proxyHosts` 里，也会被排除） |

两个域名字段的条目写法相同：普通域名、`域名:端口`、完整 URL、或 `.域名` / `*.域名` 后缀条目（支持从下拉列表选择已知模型域名）。

## 与 DSH 0.1.3+ 内置代理的关系

DSH 0.1.3 起自带环境变量代理（`HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY` / `NO_PROXY`）：**所有**出站请求都遵循它（用 `NO_PROXY` 排除，不支持 SOCKS）。本插件方向相反——**默认只有模型域名走代理**，并且支持 SOCKS 和设置页热切换：

- 整个环境都要走代理 → 用 DSH 自带的环境变量即可，无需本插件
- 只有模型请求要走代理、代理是 SOCKS、或想随时在 UI 切换 → 用本插件
- 两者同时启用 → 模型请求走本插件的代理，其余请求走 DSH 环境变量代理

## 卸载

```bash
dsh plugin --profile web remove dsh-http-proxy
dsh --profile web    # 重启生效
```

卸载后 DSH 完全恢复直连，不残留任何配置改动。

## 限制

- 按**域名**区分「模型请求」和「其它请求」。某域名同时承载模型和别的用途时（自动识别列表里的 `chatgpt.com`、`api.cloudflare.com` 等），那些请求也会一并走代理；介意的话把相关域名写进「排除域名」。
- `transport: websocket` 的流式传输不经 `fetch`，保持直连。
- amazon-bedrock 等经厂商原生 SDK 私有通道发出的请求不经 `fetch`，本插件无法代理；这类请求可用 DSH 0.1.3+ 自带的环境变量代理处理。
- 代理认证仅支持在代理 URL 中内嵌凭据（如 `http://user:pass@host:port`，DSH 会原样保存并在设置界面显示该 URL）；不提供单独的认证配置字段。

## 开发

改完 `src/` 后重新构建并提交 `lib/`：

```bash
pnpm install
pnpm build      # 生成 lib/
git add lib/
git commit -m "build"
```

## License

MIT
