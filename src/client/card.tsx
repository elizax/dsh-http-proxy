/**
 * The http-proxy settings card: a header naming the plugin, disclosing its
 * controls in place — the same collapse/expand chrome the host's own plugin
 * cards use (PluginCard + ValueField). Fields stage drafts and write only on
 * save through the `http-proxy` settings scope.
 */

import { useState } from 'react'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { HttpProxyCardFace } from './card-controller.js'
import type {} from './slot-contract.js'
import css from './card.module.css'

/** Props the renderer binds for the http-proxy card. */
export type HttpProxyCardProps =
  PropsRuntime<'settings.plugin.item'>
  & InjectFace<HttpProxyCardFace>

/** One labelled text field: label over input, hint under it. */
function ValueField(props: {
  id: string
  label: string
  hint: string
  placeholder: string
  value: string
  disabled: boolean
  onEdit: (text: string) => void
}) {
  return (
    <div className={css.field}>
      <div className={css.head}>
        <label className={css.label} htmlFor={props.id}>{props.label}</label>
      </div>
      <input
        id={props.id}
        className={css.input}
        type="text"
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={(event) => { props.onEdit(event.target.value) }}
      />
      <p className={css.hint}>{props.hint}</p>
    </div>
  )
}

/**
 * Render the http-proxy card.
 * @param props - the card snapshot and its form actions.
 * @returns the card, or nothing while the namespace is unavailable.
 */
export function HttpProxyCard(props: HttpProxyCardProps) {
  const [open, setOpen] = useState(false)
  const state = props.useHttpProxyCard(snapshot => snapshot)
  if (!state.available) return null
  const disabled = !state.writable
  return (
    <li className={open ? `${css.card} ${css.cardOpen}` : css.card}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        aria-label={`${open ? '收起设置' : '展开设置'}：HTTP 代理`}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.headText}>
          <span className={css.name}>HTTP 代理</span>
          <span className={css.description}>给模型 API 请求配置正向代理；web 搜索等其它请求仍直连。</span>
        </span>
        {state.dirty ? <span className={css.pending}>未保存</span> : null}
        <IconChevronDownOutline14 className={open ? `${css.chevron} ${css.chevronOpen}` : css.chevron} />
      </button>
      {open
        ? (
          <div className={css.body}>
            {!state.writable ? <p className={css.readOnly} role="status">本部署的设置为只读。</p> : null}
            <ValueField
              id="http-proxy-url"
              label="代理地址"
              hint="支持 http / https / socks4 / socks4a / socks5 / socks5h；留空则插件不生效。"
              placeholder="socks5://127.0.0.1:7890"
              value={state.proxy}
              disabled={disabled}
              onEdit={text => { props.edit('proxy', text) }}
            />
            <ValueField
              id="http-proxy-hosts"
              label="只代理这些域名"
              hint="留空 = 自动代理所有模型域名；填写 = 只代理列出的这些域名（逗号分隔）。"
              placeholder="gateway.acme.example"
              value={state.proxyHosts}
              disabled={disabled}
              onEdit={text => { props.edit('proxyHosts', text) }}
            />
            <ValueField
              id="http-proxy-exclude"
              label="排除域名"
              hint="永远不走代理，优先级最高（逗号分隔，可选）。"
              placeholder="api.deepseek.com"
              value={state.excludeHosts}
              disabled={disabled}
              onEdit={text => { props.edit('excludeHosts', text) }}
            />
            <div className={css.footer}>
              {state.failed
                ? <p className={`${css.status} ${css.statusFailed}`} role="status">保存失败，请重试</p>
                : state.saved
                  ? <p className={`${css.status} ${css.statusSaved}`} role="status">已保存 ✓</p>
                  : state.saving
                    ? <p className={css.status} role="status">正在写入…</p>
                    : null}
              <button
                type="button"
                className={css.save}
                disabled={!state.dirty || disabled || state.saving}
                onClick={props.save}
              >
                {state.saving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        )
        : null}
    </li>
  )
}
