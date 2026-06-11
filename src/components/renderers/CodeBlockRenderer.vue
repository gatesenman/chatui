<script setup lang="ts">
import { computed, ref } from 'vue'
import hljs from 'highlight.js'
import type { CodeBlock } from '../../types'
import type { Locale } from '../../i18n'
import { getLocale } from '../../i18n'

const props = defineProps<{ block: CodeBlock; locale?: Locale }>()

const t = computed(() => props.locale ?? getLocale())

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
        <svg v-if="!copied" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {{ copied ? t.copied : t.copy }}
      </button>
    </div>
    <pre class="ac-codeblock__body"><code class="hljs" v-html="html" /></pre>
  </div>
</template>

<style>
.ac-codeblock { border-radius: 10px; overflow: hidden; background: #1e1e2e; margin: 6px 0; box-shadow: var(--ac-shadow-sm); }
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
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 5px;
  transition: color var(--ac-transition);
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
