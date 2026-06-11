<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps<{ content: string }>()

const renderer = new marked.Renderer()
renderer.code = (code: string, lang?: string) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(code, { language }).value
  return `<pre class="ac-md-code"><code class="hljs language-${language}">${highlighted}</code></pre>`
}

const html = computed(() =>
  marked.parse(props.content, { renderer, breaks: true, async: false }) as string
)
</script>

<template>
  <div class="ac-markdown" v-html="html" />
</template>

<style>
.ac-markdown { line-height: 1.65; word-break: break-word; }
.ac-markdown > :first-child { margin-top: 0; }
.ac-markdown > :last-child { margin-bottom: 0; }
.ac-markdown h1, .ac-markdown h2, .ac-markdown h3 { margin: 0.8em 0 0.4em; line-height: 1.35; }
.ac-markdown h1 { font-size: 1.3em; }
.ac-markdown h2 { font-size: 1.18em; }
.ac-markdown h3 { font-size: 1.05em; }
.ac-markdown p { margin: 0.45em 0; }
.ac-markdown ul, .ac-markdown ol { margin: 0.45em 0; padding-left: 1.4em; }
.ac-markdown blockquote {
  margin: 0.5em 0;
  padding: 4px 12px;
  border-left: 3px solid var(--ac-primary);
  background: var(--ac-bg-soft);
  color: var(--ac-text-secondary);
  border-radius: 4px;
}
.ac-markdown code:not(.hljs) {
  background: var(--ac-bg-soft);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.92em;
}
.ac-markdown table { border-collapse: collapse; margin: 0.5em 0; }
.ac-markdown th, .ac-markdown td { border: 1px solid var(--ac-border); padding: 5px 10px; }
.ac-md-code {
  background: #1e1e2e;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  font-size: 12.5px;
}
.ac-markdown a { color: var(--ac-primary); }
</style>
