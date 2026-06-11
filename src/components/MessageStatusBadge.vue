<script setup lang="ts">
import type { MessageStatus } from '../types'
import type { Locale } from '../i18n'

const props = defineProps<{ status: MessageStatus; locale: Locale }>()

const statusConfig: Record<MessageStatus, { class: string; key: keyof Locale }> = {
  pending: { class: 'ac-status--muted', key: 'pending' },
  thinking: { class: 'ac-status--info', key: 'thinking' },
  running: { class: 'ac-status--info', key: 'running' },
  streaming: { class: 'ac-status--info', key: 'streaming' },
  waiting_hitl: { class: 'ac-status--warning', key: 'waitingConfirm' },
  completed: { class: 'ac-status--success', key: 'completed' },
  failed: { class: 'ac-status--danger', key: 'failed' },
  canceled: { class: 'ac-status--muted', key: 'canceled' }
}
</script>

<template>
  <span class="ac-status" :class="statusConfig[status]?.class">
    <span v-if="status === 'thinking' || status === 'running' || status === 'streaming'" class="ac-status__spinner"></span>
    {{ props.locale[statusConfig[status]?.key ?? 'pending'] }}
  </span>
</template>

<style>
.ac-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 999px;
  line-height: 1.4;
}
.ac-status--info { color: var(--ac-info); background: rgba(59, 130, 246, 0.08); }
.ac-status--warning { color: var(--ac-warning); background: rgba(245, 158, 11, 0.08); }
.ac-status--success { color: var(--ac-success); background: rgba(16, 185, 129, 0.08); }
.ac-status--danger { color: var(--ac-danger); background: rgba(239, 68, 68, 0.08); }
.ac-status--muted { color: var(--ac-text-tertiary); background: var(--ac-bg-hover); }
.ac-status__spinner {
  width: 10px;
  height: 10px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ac-spin 0.8s linear infinite;
}
</style>
