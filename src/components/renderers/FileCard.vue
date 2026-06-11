<script setup lang="ts">
import { computed } from 'vue'
import type { FileBlock } from '../../types'
import type { Locale } from '../../i18n'
import { getLocale } from '../../i18n'

const props = defineProps<{ block: FileBlock; locale?: Locale }>()

const t = computed(() => props.locale ?? getLocale())
const emit = defineEmits<{ download: [block: FileBlock] }>()

const sizeText = computed(() => {
  const s = props.block.size
  if (!s) return ''
  if (s < 1024) return `${s} B`
  if (s < 1024 * 1024) return `${(s / 1024).toFixed(1)} KB`
  return `${(s / 1024 / 1024).toFixed(1)} MB`
})

const ext = computed(() => {
  const m = props.block.name.match(/\.([a-z0-9]+)$/i)
  return (m?.[1] || 'file').toUpperCase().slice(0, 4)
})

function onDownload() {
  emit('download', props.block)
  if (props.block.url) window.open(props.block.url, '_blank')
}
</script>

<template>
  <div class="ac-filecard">
    <div class="ac-filecard__icon">{{ ext }}</div>
    <div class="ac-filecard__info">
      <div class="ac-filecard__name" :title="block.name">{{ block.name }}</div>
      <div class="ac-filecard__meta">
        <span v-if="sizeText">{{ sizeText }}</span>
        <span v-if="block.description">{{ block.description }}</span>
      </div>
    </div>
    <button class="ac-btn ac-btn--sm" type="button" @click="onDownload">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      {{ t.download }}
    </button>
  </div>
</template>

<style>
.ac-filecard {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--ac-border);
  border-radius: 12px;
  padding: 10px 12px;
  margin: 6px 0;
  max-width: 380px;
  background: var(--ac-bg);
  transition: border-color var(--ac-transition), box-shadow var(--ac-transition);
}
.ac-filecard:hover { border-color: var(--ac-primary); box-shadow: var(--ac-shadow-sm); }
.ac-filecard__icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--ac-primary-soft);
  color: var(--ac-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.ac-filecard__info { flex: 1; min-width: 0; }
.ac-filecard__name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ac-filecard__meta { font-size: 12px; color: var(--ac-text-secondary); display: flex; gap: 8px; }
</style>
