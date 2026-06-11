<script setup lang="ts">
import { ref } from 'vue'
import type { StepsBlock, StepStatus } from '../../types'

defineProps<{ block: StepsBlock }>()
const emit = defineEmits<{ openTrace: [traceId: string] }>()

const collapsed = ref(false)

const STATUS_ICON: Record<StepStatus, string> = {
  pending: '-',
  running: '..',
  completed: 'OK',
  failed: 'X',
  skipped: '--'
}
</script>

<template>
  <div class="ac-steps">
    <div class="ac-steps__header" @click="collapsed = !collapsed">
      <span class="ac-steps__toggle">{{ collapsed ? '[+]' : '[-]' }}</span>
      <span class="ac-steps__title">执行过程</span>
      <button
        v-if="block.traceId"
        class="ac-btn ac-btn--text ac-btn--sm"
        type="button"
        @click.stop="emit('openTrace', block.traceId!)"
      >
        查看 Trace 详情
      </button>
    </div>
    <transition name="ac-steps-fold">
      <ul v-if="!collapsed" class="ac-steps__list">
        <li v-for="step in block.steps" :key="step.id" class="ac-steps__item" :class="`is-${step.status}`">
          <span class="ac-steps__icon" :class="{ 'is-spinning': step.status === 'running' }">
            {{ STATUS_ICON[step.status] }}
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
  border-radius: 8px;
  margin: 4px 0;
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
.ac-steps__toggle { color: var(--ac-text-secondary); font-size: 11px; }
.ac-steps__list { list-style: none; margin: 0; padding: 8px 12px; display: flex; flex-direction: column; gap: 7px; }
.ac-steps__item { display: flex; align-items: baseline; gap: 8px; }
.ac-steps__icon { width: 16px; text-align: center; flex-shrink: 0; color: var(--ac-text-secondary); }
.ac-steps__item.is-completed .ac-steps__icon { color: var(--ac-success); }
.ac-steps__item.is-failed .ac-steps__icon { color: var(--ac-danger); }
.ac-steps__item.is-running .ac-steps__icon { color: var(--ac-primary); }
.ac-steps__icon.is-spinning { animation: ac-spin 1s linear infinite; display: inline-block; }
@keyframes ac-spin { to { transform: rotate(360deg); } }
.ac-steps__body { flex: 1; display: flex; flex-direction: column; }
.ac-steps__item.is-pending .ac-steps__name { color: var(--ac-text-secondary); }
.ac-steps__detail { font-size: 12px; color: var(--ac-text-secondary); }
.ac-steps__duration { font-size: 11px; color: var(--ac-text-secondary); }
.ac-steps-fold-enter-active, .ac-steps-fold-leave-active { transition: opacity 0.15s; }
.ac-steps-fold-enter-from, .ac-steps-fold-leave-to { opacity: 0; }
</style>
