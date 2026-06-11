<script setup lang="ts">
import type { MessageStatus } from '../types'

defineProps<{ status: MessageStatus }>()

const LABELS: Record<MessageStatus, string> = {
  pending: '排队中',
  thinking: '思考中',
  running: '执行中',
  streaming: '回复中',
  waiting_hitl: '等待确认',
  completed: '完成',
  failed: '失败',
  canceled: '已停止'
}
</script>

<template>
  <span class="ac-status" :class="`is-${status}`">
    <span
      v-if="['pending', 'thinking', 'running', 'streaming'].includes(status)"
      class="ac-status__spinner"
    />
    {{ LABELS[status] }}
  </span>
</template>

<style>
.ac-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--ac-bg-soft);
  color: var(--ac-text-secondary);
}
.ac-status.is-failed { color: var(--ac-danger); background: rgba(220, 38, 38, 0.08); }
.ac-status.is-waiting_hitl { color: var(--ac-warning); background: rgba(217, 119, 6, 0.1); }
.ac-status.is-completed { color: var(--ac-success); background: rgba(22, 163, 74, 0.08); }
.ac-status__spinner {
  width: 10px;
  height: 10px;
  border: 1.5px solid var(--ac-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: ac-spin 0.8s linear infinite;
}
</style>
