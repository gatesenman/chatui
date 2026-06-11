<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatMessage, ChatbotConfig, ChatbotTheme, HitlActionPayload, FormSubmitPayload, FeedbackPayload, CorrectionPayload, ContentBlock, FileBlock } from '../types'
import type { Locale } from '../i18n'
import MessageStatusBadge from './MessageStatusBadge.vue'
import FeedbackBar from './FeedbackBar.vue'
import MarkdownRenderer from './renderers/MarkdownRenderer.vue'
import CodeBlockRenderer from './renderers/CodeBlockRenderer.vue'
import TableRenderer from './renderers/TableRenderer.vue'
import ChartRenderer from './renderers/ChartRenderer.vue'
import FileCard from './renderers/FileCard.vue'
import DynamicForm from './forms/DynamicForm.vue'
import ApprovalCard from './hitl/ApprovalCard.vue'
import ExecutionSteps from './run/ExecutionSteps.vue'

const props = defineProps<{
  message: ChatMessage
  config: ChatbotConfig
  locale: Locale
  theme: ChatbotTheme
}>()

const emit = defineEmits<{
  retry: []
  'hitl-action': [payload: HitlActionPayload]
  'form-submit': [payload: FormSubmitPayload]
  feedback: [payload: FeedbackPayload]
  correction: [payload: CorrectionPayload]
  'open-trace': [traceId: string]
  'file-download': [block: FileBlock]
}>()

const isUser = computed(() => props.message.role === 'user')
const layout = computed(() => props.theme.layout ?? 'bubble')
const hasShadow = computed(() => props.theme.bubbleShadow !== false)
const avatarShape = computed(() => props.theme.avatarShape ?? 'circle')
const showCopy = computed(() => props.config.enableCopyMessage !== false && !isUser.value)
const copyState = ref<'idle' | 'copied'>('idle')

function getTextContent(): string {
  return props.message.blocks.map((b: ContentBlock) => {
    if (b.type === 'text') return b.text
    if (b.type === 'markdown') return b.content
    if (b.type === 'code') return b.code
    return ''
  }).filter(Boolean).join('\n\n')
}

function copyMessage() {
  const text = getTextContent()
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    copyState.value = 'copied'
    setTimeout(() => { copyState.value = 'idle' }, 2000)
  })
}

const isStreaming = computed(() => {
  const s = props.message.status
  return s === 'streaming' || s === 'running'
})
</script>

<template>
  <div
    class="ac-msg"
    :class="{
      'ac-msg--user': isUser,
      'ac-msg--assistant': !isUser,
      'ac-msg--document': layout === 'document',
      'ac-msg--bubble': layout === 'bubble'
    }"
  >
    <!-- Avatar -->
    <div
      v-if="layout === 'bubble'"
      class="ac-msg__avatar"
      :class="`ac-avatar--${avatarShape}`"
    >
      <img
        v-if="isUser ? theme.userAvatar : theme.avatar"
        :src="isUser ? theme.userAvatar : theme.avatar"
        alt=""
      />
      <span v-else class="ac-msg__avatar-fallback">{{ isUser ? 'U' : 'A' }}</span>
    </div>

    <!-- Content -->
    <div class="ac-msg__body" :class="{ 'ac-msg__body--shadow': hasShadow && layout === 'bubble' }">
      <!-- Status badge -->
      <MessageStatusBadge
        v-if="!isUser && message.status !== 'completed'"
        :status="message.status"
        :locale="locale"
      />

      <!-- Content blocks -->
      <template v-for="(block, bIdx) in message.blocks" :key="bIdx">
        <p v-if="block.type === 'text'" class="ac-msg__text">{{ block.text }}</p>
        <MarkdownRenderer v-else-if="block.type === 'markdown'" :content="block.content" />
        <CodeBlockRenderer v-else-if="block.type === 'code'" :block="block" :locale="locale" />
        <TableRenderer v-else-if="block.type === 'table'" :block="block" />
        <ChartRenderer v-else-if="block.type === 'chart'" :block="block" />
        <FileCard
          v-else-if="block.type === 'file'"
          :block="block"
          :locale="locale"
          @download="emit('file-download', $event)"
        />
        <DynamicForm
          v-else-if="block.type === 'form'"
          :block="block"
          :message-id="message.id"
          :locale="locale"
          @submit="emit('form-submit', $event)"
        />
        <ApprovalCard
          v-else-if="block.type === 'hitl'"
          :block="block"
          :message-id="message.id"
          :locale="locale"
          @action="emit('hitl-action', $event)"
        />
        <ExecutionSteps
          v-else-if="block.type === 'steps'"
          :block="block"
          :locale="locale"
          @open-trace="emit('open-trace', $event)"
        />
      </template>

      <!-- Streaming cursor -->
      <span
        v-if="isStreaming && !isUser"
        class="ac-msg__cursor"
      />

      <!-- Attachments -->
      <div v-if="message.attachments?.length" class="ac-msg__attachments">
        <span v-for="att in message.attachments" :key="att.id" class="ac-tag">[{{ locale.attachment }}] {{ att.name }}</span>
      </div>

      <!-- Error state -->
      <div v-if="message.status === 'failed'" class="ac-msg__error">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ message.error || locale.executionFailed }}
      </div>

      <!-- Actions bar -->
      <div v-if="!isUser" class="ac-msg__actions">
        <button
          v-if="message.status === 'failed'"
          class="ac-btn ac-btn--sm"
          type="button"
          @click="emit('retry')"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M2 8a6 6 0 0111.47-2.47M14 8A6 6 0 012.53 10.47" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M14 2v4h-4M2 14v-4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ locale.retry }}
        </button>

        <button
          v-if="showCopy && message.status === 'completed'"
          class="ac-btn ac-btn--text ac-btn--sm"
          type="button"
          @click="copyMessage"
        >
          <svg v-if="copyState === 'idle'" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M3 11V3.5A.5.5 0 013.5 3H11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          {{ copyState === 'copied' ? locale.copied : locale.copyMessage }}
        </button>

        <button
          v-if="message.traceId"
          class="ac-btn ac-btn--text ac-btn--sm"
          type="button"
          @click="emit('open-trace', message.traceId!)"
        >
          {{ locale.viewTrace }}
        </button>
      </div>

      <!-- Feedback -->
      <FeedbackBar
        v-if="!isUser && config.enableFeedback && message.status === 'completed'"
        :message="message"
        :locale="locale"
        @feedback="emit('feedback', $event)"
        @correction="emit('correction', $event)"
      />
    </div>
  </div>
</template>

<style>
.ac-msg { display: flex; gap: 12px; max-width: 100%; }
.ac-msg--user { flex-direction: row-reverse; }
.ac-msg--user.ac-msg--document { flex-direction: row; }

/* Avatar */
.ac-msg__avatar {
  width: var(--ac-avatar-size);
  height: var(--ac-avatar-size);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.ac-msg--user .ac-msg__avatar { background: var(--ac-primary-soft); }
.ac-msg--assistant .ac-msg__avatar { background: var(--ac-bg-hover); }
.ac-msg__avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-msg__avatar-fallback { font-size: 13px; font-weight: 600; color: var(--ac-text-secondary); }
.ac-msg--user .ac-msg__avatar-fallback { color: var(--ac-primary); }

/* Body */
.ac-msg__body {
  min-width: 0;
  max-width: var(--ac-max-message-width, 85%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ac-msg--document .ac-msg__body { max-width: 100%; }

.ac-msg--bubble.ac-msg--user .ac-msg__body {
  background: var(--ac-user-bubble);
  color: #fff;
  padding: 10px 16px;
  border-radius: var(--ac-bubble-radius);
  border-top-right-radius: 4px;
}
.ac-msg--bubble.ac-msg--assistant .ac-msg__body {
  background: var(--ac-assistant-bubble);
  padding: 12px 16px;
  border-radius: var(--ac-bubble-radius);
  border-top-left-radius: 4px;
}
.ac-msg__body--shadow { box-shadow: var(--ac-shadow-sm); }

/* Text */
.ac-msg__text { margin: 0; white-space: pre-wrap; word-break: break-word; line-height: 1.65; }

/* Streaming cursor */
.ac-msg__cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--ac-primary);
  animation: ac-blink 1s steps(2) infinite;
  vertical-align: text-bottom;
  margin-left: 1px;
}

/* Attachments */
.ac-msg__attachments { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }

/* Error */
.ac-msg__error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--ac-radius-sm);
  background: rgba(239, 68, 68, 0.06);
  color: var(--ac-danger);
  font-size: 13px;
  border: 1px solid rgba(239, 68, 68, 0.12);
}

/* Actions */
.ac-msg__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  opacity: 0.6;
  transition: opacity var(--ac-transition);
}
.ac-msg:hover .ac-msg__actions { opacity: 1; }
</style>
