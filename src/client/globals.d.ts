/**
 * Ambient declarations for the browser client bundle.
 *
 * `@deepseek-ai/dsh-client-ui-primitives` is resolved at runtime through the
 * host's frozen platform module table (external), so this package declares
 * only the members it uses — mirroring how the host's own cards import it.
 */

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { ReactElement } from 'react'

  export function IconChevronDownOutline14(props: {
    size?: number
    className?: string | undefined
  }): ReactElement
}
