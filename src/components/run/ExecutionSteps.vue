<script setup lang="ts">
import { computed, ref } from 'vue'
import type { StepsBlock } from '../../types'
import type { Locale } from '../../i18n'
import { getLocale } from '../../i18n'

const props = defineProps<{ block: StepsBlock; locale?: Locale }>()
const emit = defineEmits<{ openTrace: [traceId: string] }>()

const t = computed(() => props.locale ?? getLocale())

const collapsed = ref(false)
</script>

<template>
  <div class="ac-steps">
    <div class="ac-steps__header" @click="collapsed = !collapsed">
      <svg class="ac-steps__toggle" :class="{ 'is-collapsed': collapsed }" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      <span class="ac-steps__title">{{ t.executionProcess }}</span>
      <button
        v-if="block.traceId"
        class="ac-btn ac-btn--text ac-btn--sm"
        type="button"
        @click.stop="emit('openTrace', block.traceId!)"
      >
        {{ t.viewTrace }}
      </button>
    </div>
    <transition name="ac-steps-fold">
      <ul v-if="!collapsed" class="ac-steps__list">
        <li v-for="step in block.steps" :key="step.id" class="ac-steps__item" :class="`is-${step.status}`">
          <span class="ac-steps__icon">
            <svg v-if="step.status === 'completed'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="step.status === 'failed'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span v-else-if="step.status === 'running'" class="ac-steps__spinner"></span>
            <span v-else class="ac-steps__dot"></span>
          </span>
          <div class="ac-steps__body">
            <span class="ac-steps__name">{{ step.name }}</span>
            <span v-if="step.detail" class="ac-steps__detail">{{ step.detail }}</span>
          </div>
          <span v-if="step.startedAt && step.finishedAt" class="ac-steps__duration">
            {{ ((step.finishedAt - step.startedAt) / 1000).toFixed(1) }}s
          </span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<style>
.ac-steps {
  border: 1px solid var(--ac-border);
  border-radius: 10px;
  margin: 6px 0;
  max-width: 460px;
  font-size: 13px;
  overflow: hidden;
}
.ac-steps__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  background: var(--ac-bg-soft);
  user-select: none;
}
.ac-steps__title { font-weight: 500; flex: 1; }
.ac-steps__toggle { color: var(--ac-text-secondary); transition: transform var(--ac-transition); }
.ac-steps__toggle.is-collapsed { transform: rotate(-90deg); }
.ac-steps__list { list-style: none; margin: 0; padding: 8px 12px; display: flex; flex-direction: column; gap: 7px; }
.ac-steps__item { display: flex; align-items: baseline; gap: 8px; }
.ac-steps__icon { width: 16px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--ac-text-secondary); }
.ac-steps__spinner {
  width: 10px; height: 10px;
  border: 1.5px solid var(--ac-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: ac-spin 0.8s linear infinite;
}
.ac-steps__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ac-border); }
.ac-steps__item.is-completed .ac-steps__icon { color: var(--ac-success); }
.ac-steps__item.is-failed .ac-steps__icon { color: var(--ac-danger); }
.ac-steps__item.is-running .ac-steps__icon { color: var(--ac-primary); }
.ac-steps__body { flex: 1; display: flex; flex-direction: column; }
.ac-steps__item.is-pending .ac-steps__name { color: var(--ac-text-secondary); }
.ac-steps__detail { font-size: 12px; color: var(--ac-text-secondary); }
.ac-steps__duration { font-size: 11px; color: var(--ac-text-secondary); }
.ac-steps-fold-enter-active, .ac-steps-fold-leave-active { transition: opacity 0.15s; }
.ac-steps-fold-enter-from, .ac-steps-fold-leave-to { opacity: 0; }
</style>
