window.__ModuleLoader__.load({
	id: "dsh-http-proxy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region \0dsh-css:D:\dsh\dsh-http-proxy\src\client\card.module.css.mjs
		const css = ".rpIhcq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}.rpIhcq_card:hover{border-color:var(--dsw-alias-label-dimmed)}.rpIhcq_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.rpIhcq_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.rpIhcq_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.rpIhcq_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.rpIhcq_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.rpIhcq_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.rpIhcq_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.rpIhcq_chevronOpen{transform:rotate(180deg)}.rpIhcq_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.rpIhcq_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.rpIhcq_pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.rpIhcq_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.rpIhcq_field+.rpIhcq_field{border-top:1px solid var(--dsw-alias-border-l2)}.rpIhcq_head{align-items:center;gap:8px;display:flex}.rpIhcq_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.rpIhcq_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.rpIhcq_input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.rpIhcq_input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.rpIhcq_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.rpIhcq_footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.rpIhcq_status{min-width:0;color:var(--dsw-alias-label-tertiary);flex:1;margin:0;font-size:12px;line-height:1.5}.rpIhcq_statusSaved{color:var(--dsw-alias-state-success-primary)}.rpIhcq_statusFailed{color:var(--dsw-alias-label-error)}.rpIhcq_save{appearance:none;font:inherit;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.rpIhcq_save:disabled{opacity:.4;cursor:default}.rpIhcq_save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}";
		const tagId = "dsh-http-proxy/card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-http-proxy";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var card_module_css_default = {
			"body": "rpIhcq_body",
			"card": "rpIhcq_card",
			"cardOpen": "rpIhcq_cardOpen",
			"chevron": "rpIhcq_chevron",
			"chevronOpen": "rpIhcq_chevronOpen",
			"description": "rpIhcq_description",
			"field": "rpIhcq_field",
			"footer": "rpIhcq_footer",
			"head": "rpIhcq_head",
			"headText": "rpIhcq_headText",
			"header": "rpIhcq_header",
			"hint": "rpIhcq_hint",
			"input": "rpIhcq_input",
			"label": "rpIhcq_label",
			"name": "rpIhcq_name",
			"pending": "rpIhcq_pending",
			"readOnly": "rpIhcq_readOnly",
			"save": "rpIhcq_save",
			"status": "rpIhcq_status",
			"statusFailed": "rpIhcq_statusFailed",
			"statusSaved": "rpIhcq_statusSaved"
		};
		//#endregion
		//#region src/client/card.tsx
		/**
		* The http-proxy settings card: a header naming the plugin, disclosing its
		* controls in place — the same collapse/expand chrome the host's own plugin
		* cards use (PluginCard + ValueField). Fields stage drafts and write only on
		* save through the `http-proxy` settings scope.
		*/
		/** One labelled text field: label over input, hint under it. */
		function ValueField(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: card_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: card_module_css_default.head,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: card_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: props.id,
						className: card_module_css_default.input,
						type: "text",
						value: props.value,
						placeholder: props.placeholder,
						disabled: props.disabled,
						list: props.list,
						onChange: (event) => {
							props.onEdit(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: card_module_css_default.hint,
						children: props.hint
					})
				]
			});
		}
		/**
		* Render the http-proxy card.
		* @param props - the card snapshot and its form actions.
		* @returns the card, or nothing while the namespace is unavailable.
		*/
		function HttpProxyCard(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const state = props.useHttpProxyCard((snapshot) => snapshot);
			if (!state.available) return null;
			const disabled = !state.writable;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: open ? `${card_module_css_default.card} ${card_module_css_default.cardOpen}` : card_module_css_default.card,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: card_module_css_default.header,
					"aria-expanded": open,
					"aria-label": `${open ? "收起设置" : "展开设置"}：HTTP 代理`,
					onClick: () => {
						setOpen(!open);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: card_module_css_default.headText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: card_module_css_default.name,
								children: "HTTP 代理"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: card_module_css_default.description,
								children: "给模型 API 请求配置正向代理；web 搜索等其它请求仍直连。"
							})]
						}),
						state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: card_module_css_default.pending,
							children: "未保存"
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? `${card_module_css_default.chevron} ${card_module_css_default.chevronOpen}` : card_module_css_default.chevron })
					]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: card_module_css_default.body,
					children: [
						!state.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: card_module_css_default.readOnly,
							role: "status",
							children: "本部署的设置为只读。"
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("datalist", {
							id: "http-proxy-model-hosts",
							children: state.suggestions.map((host) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", { value: host }, host))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
							id: "http-proxy-url",
							label: "代理地址",
							hint: "支持 http / https / socks4 / socks4a / socks5 / socks5h；留空则插件不生效。",
							placeholder: "socks5://127.0.0.1:7890",
							value: state.proxy,
							disabled,
							onEdit: (text) => {
								props.edit("proxy", text);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
							id: "http-proxy-hosts",
							label: "只代理这些域名",
							hint: "留空 = 自动代理所有模型域名；填写 = 只代理列出的这些域名（逗号分隔，可从下拉选择）。",
							placeholder: "gateway.acme.example",
							value: state.proxyHosts,
							disabled,
							list: "http-proxy-model-hosts",
							onEdit: (text) => {
								props.edit("proxyHosts", text);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
							id: "http-proxy-exclude",
							label: "排除域名",
							hint: "永远不走代理，优先级最高（逗号分隔，可选，可从下拉选择）。",
							placeholder: "api.deepseek.com",
							value: state.excludeHosts,
							disabled,
							list: "http-proxy-model-hosts",
							onEdit: (text) => {
								props.edit("excludeHosts", text);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: card_module_css_default.footer,
							children: [state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: `${card_module_css_default.status} ${card_module_css_default.statusFailed}`,
								role: "status",
								children: "保存失败，请重试"
							}) : state.saved ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: `${card_module_css_default.status} ${card_module_css_default.statusSaved}`,
								role: "status",
								children: "已保存 ✓"
							}) : state.saving ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: card_module_css_default.status,
								role: "status",
								children: "正在写入…"
							}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: card_module_css_default.save,
								disabled: !state.dirty || disabled || state.saving,
								onClick: props.save,
								children: state.saving ? "保存中…" : "保存"
							})]
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region src/client/card-controller.ts
		/** The official DeepSeek adapter's default endpoint host; keep in sync with src/index.ts. */
		const DEFAULT_DEEPSEEK_HOST = "api.deepseek.com";
		/** Extract the hostname from an absolute URL string; throws on malformed input. */
		function hostnameOf(value) {
			return new URL(value).hostname;
		}
		/** Bridges the `http-proxy` scope onto the card with a minimal staged form. */
		var HttpProxyCardController = class {
			scope;
			known;
			store;
			staged = /* @__PURE__ */ new Map();
			saving = false;
			saved = false;
			failed = false;
			/**
			* @param scope - the bound settings scope for the `http-proxy` namespace.
			* @param known - the bound read-only `llm-pi-ai` scope that supplies gateway hostnames.
			*/
			constructor(scope, known) {
				this.scope = scope;
				this.known = known;
				this.store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(this.projection());
				scope.subscribe(() => this.publish());
				known.subscribe(() => this.publish());
			}
			snapshot() {
				return this.scope.getSnapshot();
			}
			/** Hostnames offered by the host fields: the default DeepSeek host, every configured gateway, and what is already saved. */
			suggestions() {
				const hosts = /* @__PURE__ */ new Set([DEFAULT_DEEPSEEK_HOST]);
				const value = this.snapshot().value ?? {};
				const addList = (list) => {
					if (!Array.isArray(list)) return;
					for (const host of list) if (typeof host === "string" && host.length > 0) hosts.add(host);
				};
				addList(value.proxyHosts);
				addList(value.excludeHosts);
				const known = this.known.getSnapshot().value ?? {};
				for (const profile of Object.values(known.providers ?? {})) {
					const baseURL = profile.baseURL;
					if (typeof baseURL === "string" && baseURL.length > 0) try {
						hosts.add(hostnameOf(baseURL));
					} catch {}
				}
				return [...hosts].sort();
			}
			projection() {
				const snap = this.snapshot();
				const value = snap.value ?? {};
				return {
					available: snap.status === "ready",
					writable: snap.writable,
					proxy: this.staged.get("proxy") ?? (typeof value.proxy === "string" ? value.proxy : ""),
					proxyHosts: this.staged.get("proxyHosts") ?? (Array.isArray(value.proxyHosts) ? value.proxyHosts.join(", ") : ""),
					excludeHosts: this.staged.get("excludeHosts") ?? (Array.isArray(value.excludeHosts) ? value.excludeHosts.join(", ") : ""),
					suggestions: this.suggestions(),
					dirty: this.staged.size > 0,
					saving: this.saving,
					saved: this.saved,
					failed: this.failed
				};
			}
			publish() {
				this.store.set(this.projection());
			}
			/** Build the face the card's slot registration injects. */
			inject() {
				return {
					hooks: { httpProxyCard: this.store },
					edit: (field, text) => {
						this.staged.set(field, text);
						this.failed = false;
						this.saved = false;
						this.publish();
					},
					save: () => {
						this.save();
					}
				};
			}
			async save() {
				if (this.staged.size === 0 || this.saving) return;
				this.saving = true;
				this.saved = false;
				this.failed = false;
				this.publish();
				let landed = true;
				try {
					if (this.staged.has("proxy")) {
						const value = (this.staged.get("proxy") ?? "").trim();
						if (value === "") await this.scope.unset("proxy");
						else await this.scope.set("proxy", value);
					}
					if (this.staged.has("proxyHosts")) {
						const text = (this.staged.get("proxyHosts") ?? "").trim();
						if (text === "") await this.scope.unset("proxyHosts");
						else await this.scope.set("proxyHosts", this.splitHosts(text));
					}
					if (this.staged.has("excludeHosts")) {
						const text = (this.staged.get("excludeHosts") ?? "").trim();
						if (text === "") await this.scope.unset("excludeHosts");
						else await this.scope.set("excludeHosts", this.splitHosts(text));
					}
					this.staged.clear();
					this.saved = true;
				} catch {
					landed = false;
				}
				this.saving = false;
				this.failed = !landed;
				this.publish();
			}
			splitHosts(text) {
				return text.split(/[,\s]+/).filter((part) => part.length > 0);
			}
		};
		//#endregion
		//#region src/client/index.ts
		/** Settings namespace the Host half owns; keep in sync with src/index.ts. */
		const NS = "http-proxy";
		/** The `llm-pi-ai` namespace, read-only here, supplying gateway hostname suggestions. */
		const PI_AI_NS = "llm-pi-ai";
		/** Required services (cordis fiber inject). */
		const inject = ["slots", "settingsScope"];
		/**
		* Mount the http-proxy settings card.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const controller = new HttpProxyCardController(ctx.settingsScope.bind({ namespace: NS }), ctx.settingsScope.bind({ namespace: PI_AI_NS }));
			ctx.slots.inject("settings.plugin.item", function* () {
				yield ctx.slots.register({
					name: "settings.plugin.item",
					key: NS,
					inject: () => controller.inject()
				}, HttpProxyCard);
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map