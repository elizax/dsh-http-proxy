/**
 * The http-proxy settings card: a proxy URL plus optional extra hostnames,
 * staged and written on save through the `http-proxy` settings scope.
 */

import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { HttpProxyCardFace } from './card-controller.js'
import type {} from './slot-contract.js'

/** Props the renderer binds for the http-proxy card. */
export type HttpProxyCardProps =
  PropsRuntime<'settings.plugin.item'>
  & InjectFace<HttpProxyCardFace>

/** Minimal inline styles so the card needs no CSS build pipeline. */
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 0',
  } as const,
  title: { margin: 0, fontSize: '14px', fontWeight: 600 } as const,
  desc: { margin: 0, fontSize: '12px', opacity: 0.7 } as const,
  label: { fontSize: '12px', fontWeight: 500 } as const,
  input: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '6px 8px',
    fontSize: '13px',
    borderRadius: '6px',
    border: '1px solid rgba(128,128,128,0.4)',
    background: 'transparent',
    color: 'inherit',
  } as const,
  actions: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' } as const,
  button: {
    padding: '5px 12px',
    fontSize: '13px',
    borderRadius: '6px',
    border: '1px solid rgba(128,128,128,0.5)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  } as const,
  failed: { fontSize: '12px', color: '#e5484d' } as const,
  saved: { fontSize: '12px', color: '#2f9e44' } as const,
  saving: { fontSize: '12px', opacity: 0.7 } as const,
}

/**
 * Render the http-proxy card.
 * @param props - the card snapshot and its form actions.
 * @returns the card, or nothing while the namespace is unavailable.
 */
export function HttpProxyCard(props: HttpProxyCardProps) {
  const state = props.useHttpProxyCard(snapshot => snapshot)
  if (!state.available) return null
  const disabled = !state.writable || state.saving
  return (
    <div style={styles.root}>
      <p style={styles.title}>HTTP 代理</p>
      <p style={styles.desc}>给模型 API 请求配置正向代理；web 搜索等其它请求仍直连。</p>
      <label style={styles.label} htmlFor="http-proxy-url">代理地址</label>
      <input
        id="http-proxy-url"
        style={styles.input}
        type="text"
        placeholder="socks5://127.0.0.1:7890"
        value={state.proxy}
        disabled={!state.writable}
        onChange={event => { props.edit('proxy', event.target.value) }}
      />
      <label style={styles.label} htmlFor="http-proxy-hosts">只代理这些域名（留空 = 所有模型，逗号分隔）</label>
      <input
        id="http-proxy-hosts"
        style={styles.input}
        type="text"
        placeholder="gateway.acme.example"
        value={state.proxyHosts}
        disabled={!state.writable}
        onChange={event => { props.edit('proxyHosts', event.target.value) }}
      />
      <label style={styles.label} htmlFor="http-proxy-exclude">排除域名（逗号分隔，可选）</label>
      <input
        id="http-proxy-exclude"
        style={styles.input}
        type="text"
        placeholder="api.deepseek.com"
        value={state.excludeHosts}
        disabled={!state.writable}
        onChange={event => { props.edit('excludeHosts', event.target.value) }}
      />
      <div style={styles.actions}>
        <button type="button" style={styles.button} disabled={disabled || !state.dirty} onClick={props.save}>
          {state.saving ? '保存中…' : '保存'}
        </button>
        <button type="button" style={styles.button} disabled={state.saving || (!state.dirty && !state.failed)} onClick={props.discard}>
          放弃
        </button>
        {state.saving
          ? <span style={styles.saving}>正在写入…</span>
          : state.failed
            ? <span style={styles.failed}>保存失败，请重试</span>
            : state.saved
              ? <span style={styles.saved}>已保存 ✓</span>
              : null}
      </div>
    </div>
  )
}
