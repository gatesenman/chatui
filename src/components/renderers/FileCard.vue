<script setup lang="ts">
import { computed } from 'vue'
import type { FileBlock } from '../../types'

const props = defineProps<{ block: FileBlock }>()
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
    <button class="ac-btn ac-btn--sm" type="button" @click="onDownload">下载</button>
  </div>
</template>

<style>
.ac-filecard {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--ac-border);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 4px 0;
  max-width: 380px;
  background: var(--ac-bg);
}
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
