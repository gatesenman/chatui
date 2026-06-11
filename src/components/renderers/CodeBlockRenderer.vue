<script setup lang="ts">
import { computed, ref } from 'vue'
import hljs from 'highlight.js'
import type { CodeBlock } from '../../types'

const props = defineProps<{ block: CodeBlock }>()

const copied = ref(false)

const language = computed(() =>
  props.block.language && hljs.getLanguage(props.block.language) ? props.block.language : 'plaintext'
)

const html = computed(() => hljs.highlight(props.block.code, { language: language.value }).value)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.block.code)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = props.block.code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="ac-codeblock">
    <div class="ac-codeblock__header">
      <span class="ac-codeblock__lang">{{ language }}</span>
      <button class="ac-codeblock__copy" type="button" @click="copy">
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre class="ac-codeblock__body"><code class="hljs" v-html="html" /></pre>
  </div>
</template>

<style>
.ac-codeblock { border-radius: 8px; overflow: hidden; background: #1e1e2e; margin: 4px 0; }
.ac-codeblock__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #9ca3af;
  font-size: 12px;
}
.ac-codeblock__copy {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 12px;
}
.ac-codeblock__copy:hover { color: #fff; }
.ac-codeblock__body {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  font-size: 12.5px;
  color: #e5e7eb;
  line-height: 1.55;
}
</style>
