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
        external: ['vue'],
        output: { globals: { vue: 'Vue' } }
      }
    },
    server: { port: 5173 }
  }
})
