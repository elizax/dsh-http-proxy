window.__ModuleLoader__.load({
	id: "dsh-http-proxy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region src/hosts.ts
		/**
		* Browser-safe hostname helpers shared by the Host half (routing) and the
		* browser card (suggestions). No node imports, so either bundle can inline
		* this module without dragging in `undici`.
		* @module dsh-http-proxy/hosts
		*/
		/** Extract the hostname from an absolute URL string or `URL`. */
		function hostnameOf(value) {
			return value instanceof URL ? value.hostname : new URL(value).hostname;
		}
		/**
		* Normalize a user-entered host entry to a bare lowercase hostname, matching
		* what `shouldProxy` compares requests against (`new URL(url).hostname`).
		* Accepts a plain hostname, `host:port`, or an absolute URL (scheme, port, and
		* path are all stripped). Returns undefined when nothing usable remains.
		* @param entry - a raw `proxyHosts` / `excludeHosts` entry.
		* @returns the bare hostname, or undefined for an empty/invalid entry.
		*/
		function normalizeHostEntry(entry) {
			const trimmed = entry.trim();
			if (trimmed.length === 0) return void 0;
			if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) try {
				return new URL(trimmed).hostname.toLowerCase();
			} catch {
				return;
			}
			const bare = (trimmed.split("/")[0]?.split(":")[0])?.toLowerCase();
			return bare !== void 0 && bare.length > 0 ? bare : void 0;
		}
		//#endregion
		//#region \0dsh-css:D:\dsh\dsh-http-proxy\src\client\card.module.css.mjs
		const css = ".rpIhcq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}.rpIhcq_card:hover{border-color:var(--dsw-alias-label-dimmed)}.rpIhcq_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.rpIhcq_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.rpIhcq_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.rpIhcq_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.rpIhcq_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.rpIhcq_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.rpIhcq_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.rpIhcq_chevronOpen{transform:rotate(180deg)}.rpIhcq_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.rpIhcq_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.rpIhcq_pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.rpIhcq_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.rpIhcq_field+.rpIhcq_field{border-top:1px solid var(--dsw-alias-border-l2)}.rpIhcq_head{align-items:center;gap:8px;display:flex}.rpIhcq_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.rpIhcq_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.rpIhcq_input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.rpIhcq_input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.rpIhcq_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.rpIhcq_footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.rpIhcq_status{min-width:0;color:var(--dsw-alias-label-tertiary);flex:1;margin:0;font-size:12px;line-height:1.5}.rpIhcq_statusSaved{color:var(--dsw-alias-state-success-primary)}.rpIhcq_statusFailed{color:var(--dsw-alias-label-error)}.rpIhcq_combo{position:relative}.rpIhcq_comboInput{padding-right:30px}.rpIhcq_comboChevron{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;justify-content:center;align-items:center;padding:0;display:inline-flex;position:absolute;top:50%;right:8px;transform:translateY(-50%)}.rpIhcq_comboChevron svg{transition:transform .16s}.rpIhcq_comboChevronOpen{transform:rotate(180deg)}.rpIhcq_comboChevron:disabled{opacity:.5;cursor:default}.rpIhcq_comboList{z-index:100;box-sizing:border-box;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);max-height:240px;box-shadow:var(--dsw-shadow-lv3);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;gap:0;margin:0;padding:4px;list-style:none;display:flex;position:absolute;top:calc(100% + 4px);left:0;right:0;overflow-y:auto}.rpIhcq_comboItem{cursor:pointer;width:100%;min-height:32px;font:inherit;color:var(--dsw-alias-label-primary);text-align:left;background:0 0;border:none;border-radius:8px;align-items:center;gap:8px;padding:5px 10px;font-size:13px;line-height:20px;display:flex}.rpIhcq_comboItem:hover{background:var(--dsw-alias-interactive-bg-hover)}.rpIhcq_comboEmpty{color:var(--dsw-alias-label-tertiary);padding:6px 10px;font-size:12px;line-height:18px}.rpIhcq_save{appearance:none;font:inherit;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.rpIhcq_save:disabled{opacity:.4;cursor:default}.rpIhcq_save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}";
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
			"combo": "rpIhcq_combo",
			"comboChevron": "rpIhcq_comboChevron",
			"comboChevronOpen": "rpIhcq_comboChevronOpen",
			"comboEmpty": "rpIhcq_comboEmpty",
			"comboInput": "rpIhcq_comboInput",
			"comboItem": "rpIhcq_comboItem",
			"comboList": "rpIhcq_comboList",
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
		* A hostname field that doubles as a combobox: it stays free text, but focus
		* (or a chevron) opens a dropdown of known model hostnames to pick from,
		* styled like the host's own menus rather than a browser dialog. Arrow keys
		* move the highlight, Enter picks, Escape closes.
		*/
		function HostField(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const [highlight, setHighlight] = (0, react.useState)(0);
			const present = new Set(props.value.split(/[,\s]+/).map((token) => normalizeHostEntry(token)).filter((h) => h !== void 0));
			const tail = /[^,\s]*$/.exec(props.value)?.[0] ?? "";
			const options = props.suggestions.filter((host) => !present.has(host) && (tail === "" || host.includes(tail.toLowerCase())));
			const active = open && highlight >= 0 && highlight < options.length ? highlight : -1;
			const add = (host) => {
				if (props.disabled) return;
				const parts = props.value.trim() === "" ? [] : props.value.trim().split(/[,\s]+/).filter(Boolean);
				const hasDraft = !/[,\s]$/.test(props.value);
				const last = parts[parts.length - 1];
				const committed = /* @__PURE__ */ new Set();
				for (const token of [...props.suggestions, ...parts.slice(0, -1)]) {
					const normalized = normalizeHostEntry(token);
					if (normalized !== void 0) committed.add(normalized);
				}
				const base = (hasDraft && last !== void 0 && !committed.has(normalizeHostEntry(last) ?? "") ? last : void 0) === void 0 ? parts : parts.slice(0, -1);
				if (!base.some((token) => normalizeHostEntry(token) === host)) props.onEdit(base.length === 0 ? host : `${base.join(", ")}, ${host}`);
				setHighlight(0);
			};
			const move = (delta) => {
				if (options.length === 0) return;
				setHighlight((current) => (current + delta + options.length) % options.length);
			};
			const onKeyDown = (event) => {
				if (event.key === "Escape") {
					setOpen(false);
					return;
				}
				if (event.key === "ArrowDown") {
					event.preventDefault();
					if (!open) {
						setOpen(true);
						setHighlight(0);
						return;
					}
					move(1);
					return;
				}
				if (event.key === "ArrowUp") {
					event.preventDefault();
					if (!open) {
						setOpen(true);
						setHighlight(options.length - 1);
						return;
					}
					move(-1);
					return;
				}
				if (event.key === "Enter" && open && options.length > 0) {
					event.preventDefault();
					const pick = options[active >= 0 ? active : 0];
					if (pick !== void 0) add(pick);
					return;
				}
				if (event.key === "Home" && open) {
					event.preventDefault();
					setHighlight(0);
					return;
				}
				if (event.key === "End" && open) {
					event.preventDefault();
					setHighlight(options.length - 1);
					return;
				}
			};
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: card_module_css_default.combo,
						onBlur: (event) => {
							if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: props.id,
								className: `${card_module_css_default.input} ${card_module_css_default.comboInput}`,
								type: "text",
								role: "combobox",
								"aria-expanded": open,
								"aria-controls": `${props.id}-list`,
								"aria-autocomplete": "list",
								"aria-activedescendant": active >= 0 ? `${props.id}-opt-${active}` : void 0,
								value: props.value,
								placeholder: props.placeholder,
								disabled: props.disabled,
								onFocus: () => {
									setOpen(true);
									setHighlight(0);
								},
								onChange: (event) => {
									props.onEdit(event.target.value);
									setOpen(true);
									setHighlight(0);
								},
								onKeyDown
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: card_module_css_default.comboChevron,
								"aria-label": "选择域名",
								"aria-expanded": open,
								tabIndex: -1,
								disabled: props.disabled,
								onMouseDown: (event) => {
									event.preventDefault();
								},
								onClick: () => {
									const next = !open;
									setOpen(next);
									if (next) setHighlight(0);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? card_module_css_default.comboChevronOpen : void 0 })
							}),
							open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: card_module_css_default.comboList,
								id: `${props.id}-list`,
								role: "listbox",
								children: options.length > 0 ? options.map((host, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
									role: "option",
									id: `${props.id}-opt-${index}`,
									"aria-selected": index === active,
									onMouseEnter: () => {
										setHighlight(index);
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: card_module_css_default.comboItem,
										onMouseDown: (event) => {
											event.preventDefault();
										},
										onClick: () => {
											add(host);
										},
										children: host
									})
								}, host)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
									className: card_module_css_default.comboEmpty,
									children: "无更多可选域名"
								})
							}) : null
						]
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HostField, {
							id: "http-proxy-hosts",
							label: "只代理这些域名",
							hint: "留空 = 自动代理所有模型域名；填写 = 只代理列出的这些域名（逗号分隔，支持域名 / 域名:端口 / URL，可从下拉选择）。",
							placeholder: "gateway.acme.example",
							value: state.proxyHosts,
							suggestions: state.suggestions,
							disabled,
							onEdit: (text) => {
								props.edit("proxyHosts", text);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HostField, {
							id: "http-proxy-exclude",
							label: "排除域名",
							hint: "永远不走代理，优先级最高（逗号分隔，支持域名 / 域名:端口 / URL，可从下拉选择）。",
							placeholder: "api.deepseek.com",
							value: state.excludeHosts,
							suggestions: state.suggestions,
							disabled,
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
		/** Bridges the `http-proxy` scope onto the card with a minimal staged form. */
		var HttpProxyCardController = class {
			scope;
			known;
			store;
			staged = /* @__PURE__ */ new Map();
			disposers = [];
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
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.projection());
				this.disposers.push(scope.subscribe(() => this.publish()), known.subscribe(() => this.publish()));
			}
			/** Stop observing both scopes and drop the staged drafts. Idempotent. */
			dispose() {
				for (const disposer of this.disposers.splice(0)) disposer();
				this.staged.clear();
				this.saving = false;
				this.saved = false;
				this.failed = false;
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
					for (const host of list) if (typeof host === "string") {
						const normalized = normalizeHostEntry(host);
						if (normalized !== void 0) hosts.add(normalized);
					}
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
			ctx.effect(() => () => controller.dispose());
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