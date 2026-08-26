window.__ModuleLoader__.load({
	id: "dsh-http-proxy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region src/client/card.tsx
		/** Minimal inline styles so the card needs no CSS build pipeline. */
		const styles = {
			root: {
				display: "flex",
				flexDirection: "column",
				gap: "8px",
				padding: "12px 0"
			},
			title: {
				margin: 0,
				fontSize: "14px",
				fontWeight: 600
			},
			desc: {
				margin: 0,
				fontSize: "12px",
				opacity: .7
			},
			label: {
				fontSize: "12px",
				fontWeight: 500
			},
			input: {
				boxSizing: "border-box",
				width: "100%",
				padding: "6px 8px",
				fontSize: "13px",
				borderRadius: "6px",
				border: "1px solid rgba(128,128,128,0.4)",
				background: "transparent",
				color: "inherit"
			},
			actions: {
				display: "flex",
				alignItems: "center",
				gap: "8px",
				marginTop: "4px"
			},
			button: {
				padding: "5px 12px",
				fontSize: "13px",
				borderRadius: "6px",
				border: "1px solid rgba(128,128,128,0.5)",
				background: "transparent",
				color: "inherit",
				cursor: "pointer"
			},
			failed: {
				fontSize: "12px",
				color: "#e5484d"
			}
		};
		/**
		* Render the http-proxy card.
		* @param props - the card snapshot and its form actions.
		* @returns the card, or nothing while the namespace is unavailable.
		*/
		function HttpProxyCard(props) {
			const state = props.useHttpProxyCard((snapshot) => snapshot);
			if (!state.available) return null;
			const disabled = !state.writable || state.saving;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: styles.root,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: styles.title,
						children: "HTTP 代理"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: styles.desc,
						children: "给模型 API 请求配置正向代理；web 搜索等其它请求仍直连。"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						style: styles.label,
						htmlFor: "http-proxy-url",
						children: "代理地址"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: "http-proxy-url",
						style: styles.input,
						type: "text",
						placeholder: "socks5://127.0.0.1:7890",
						value: state.proxy,
						disabled: !state.writable,
						onChange: (event) => {
							props.edit("proxy", event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						style: styles.label,
						htmlFor: "http-proxy-hosts",
						children: "额外模型域名（逗号分隔，可选）"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: "http-proxy-hosts",
						style: styles.input,
						type: "text",
						placeholder: "gateway.acme.example",
						value: state.proxyHosts,
						disabled: !state.writable,
						onChange: (event) => {
							props.edit("proxyHosts", event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: styles.actions,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.button,
								disabled,
								onClick: props.save,
								children: "保存"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.button,
								disabled: state.saving,
								onClick: props.discard,
								children: "放弃"
							}),
							state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: styles.failed,
								children: "保存失败，请重试"
							}) : null
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/card-controller.ts
		/** Bridges the `http-proxy` scope onto the card with a minimal staged form. */
		var HttpProxyCardController = class {
			scope;
			store;
			staged = /* @__PURE__ */ new Map();
			saving = false;
			failed = false;
			/** @param scope - the bound settings scope for the `http-proxy` namespace. */
			constructor(scope) {
				this.scope = scope;
				this.store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(this.projection());
				scope.subscribe(() => this.publish());
			}
			snapshot() {
				return this.scope.getSnapshot();
			}
			projection() {
				const snap = this.snapshot();
				const value = snap.value ?? {};
				return {
					available: snap.status === "ready",
					writable: snap.writable,
					proxy: this.staged.get("proxy") ?? (typeof value.proxy === "string" ? value.proxy : ""),
					proxyHosts: this.staged.get("proxyHosts") ?? (Array.isArray(value.proxyHosts) ? value.proxyHosts.join(", ") : ""),
					saving: this.saving,
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
						this.publish();
					},
					save: () => {
						this.save();
					},
					discard: () => {
						this.staged.clear();
						this.failed = false;
						this.publish();
					}
				};
			}
			async save() {
				if (this.staged.size === 0 || this.saving) return;
				this.saving = true;
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
						else await this.scope.set("proxyHosts", text.split(/[,\s]+/).filter((part) => part.length > 0));
					}
					this.staged.clear();
				} catch {
					landed = false;
				}
				this.saving = false;
				this.failed = !landed;
				this.publish();
			}
		};
		//#endregion
		//#region src/client/index.ts
		/** Settings namespace the Host half owns; keep in sync with src/index.ts. */
		const NS = "http-proxy";
		/** Required services (cordis fiber inject). */
		const inject = ["slots", "settingsScope"];
		/**
		* Mount the http-proxy settings card.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const controller = new HttpProxyCardController(ctx.settingsScope.bind({ namespace: NS }));
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