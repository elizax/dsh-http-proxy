/**
 * tsdown build for dsh-http-proxy: the host-half lib (lib/index.js, ESM node)
 * plus the browser client bundle (lib/client.js, CJS closure factory).
 *
 * The client bundle replicates the official DSH client-bundle preset
 * (packages/client/tsdown.client.ts): externals resolve through the loader
 * module table at runtime, everything else is inlined, and the artifact
 * registers itself via window.__ModuleLoader__.load({id, factory}).
 */

import type { UserConfig } from 'tsdown'

/** Module specifiers the shell shares into the frozen module table (the official PLATFORM_MODULES + preloaded runtime client). */
const CLIENT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-runtime/client',
]

/** Client-bundle purity gate: reject cross-plugin value imports that the module table cannot answer. */
function purityGate(): NonNullable<UserConfig['plugins']> {
  return [{
    name: 'dsh-client-bundle-purity',
    resolveId(source: string) {
      if (!source.startsWith('@deepseek-ai/')) return null
      if (CLIENT_EXTERNALS.includes(source)) return null
      throw new Error(
        `client bundle purity: "${source}" is not a platform module and not an inline-safe wire layer — `
        + 'cross-plugin value imports are forbidden; collaborate through cordis services '
        + '(type-only imports are erased and never reach this gate)',
      )
    },
  }]
}

export default [
  // Host half: node ESM bundle. Production deps stay external; local files inline.
  {
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  },
  // Client half: browser CJS closure factory registered with the package-name id.
  {
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    deps: {
      neverBundle: (id: string) => CLIENT_EXTERNALS.includes(id),
      alwaysBundle: (id: string) => !CLIENT_EXTERNALS.includes(id),
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
      'import.meta.resolve': 'undefined',
    },
    plugins: purityGate(),
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: "dsh-http-proxy", factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      codeSplitting: false,
    },
  },
] satisfies UserConfig[]
