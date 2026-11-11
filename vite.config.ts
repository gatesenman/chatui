import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'demo') {
    return {
      plugins: [vue()],
      resolve: { alias: { '@agent/chat-ui': resolve(__dirname, 'src/index.ts') } },
      root: 'demo',
      base: './',
      server: { port: 5173 },
      build: { outDir: resolve(__dirname, 'dist-demo'), emptyOutDir: true }
    }
  }
  return {
    plugins: [vue()],
    resolve: { alias: { '@agent/chat-ui': resolve(__dirname, 'src/index.ts') } },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'AgentChatUI',
        fileName: 'agent-chat-ui'
      },
      rollupOptions: {
        // vue is a peer dependency; marked / highlight.js are regular dependencies, so they are
        // installed alongside the package and must not be bundled a second time.
        external: ['vue', 'marked', /^highlight\.js$/],
        output: {
          exports: 'named',
          globals: { vue: 'Vue', marked: 'marked', 'highlight.js': 'hljs' },
          // Vite 5 names the extracted lib CSS "style.css"; package.json exports "./style.css"
          // as dist/agent-chat-ui.css, so keep the file name in sync with the exports map.
          assetFileNames: (asset) =>
            asset.name === 'style.css' ? 'agent-chat-ui.css' : 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
