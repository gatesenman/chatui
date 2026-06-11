<script setup lang="ts">
import { computed } from 'vue'
import type {
  ChatMessage,
  ChatbotConfig,
  CorrectionPayload,
  FeedbackPayload,
  FileBlock,
  FormSubmitPayload,
  HitlActionPayload
} from '../types'
import MarkdownRenderer from './renderers/MarkdownRenderer.vue'
import CodeBlockRenderer from './renderers/CodeBlockRenderer.vue'
import TableRenderer from './renderers/TableRenderer.vue'
import ChartRenderer from './renderers/ChartRenderer.vue'
import FileCard from './renderers/FileCard.vue'
import DynamicForm from './forms/DynamicForm.vue'
import ApprovalCard from './hitl/ApprovalCard.vue'
import ExecutionSteps from './run/ExecutionSteps.vue'
import MessageStatusBadge from './MessageStatusBadge.vue'
import FeedbackBar from './FeedbackBar.vue'

const props = defineProps<{ message: ChatMessage; config: ChatbotConfig }>()

const emit = defineEmits<{
  retry: [messageId: string]
  hitlAction: [payload: HitlActionPayload]
  formSubmit: [payload: FormSubmitPayload]
  feedback: [payload: FeedbackPayload]
  correction: [payload: CorrectionPayload]
  openTrace: [traceId: string]
  fileDownload: [block: FileBlock]
}>()

const isUser = computed(() => props.message.role === 'user')
const isFinished = computed(() =>
  ['completed', 'failed', 'canceled'].includes(props.message.status)
)
const showStatus = computed(() => !isUser.value && props.message.status !== 'completed')
const layout = computed(() => props.config.theme?.layout ?? 'bubble')
const timeText = computed(() =>
  new Date(props.message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
)
</script>

<template>
  <div class="ac-msg" :class="[isUser ? 'is-user' : 'is-assistant', `is-layout-${layout}`]">
    <div class="ac-msg__avatar">
      <img
        v-if="isUser ? config.theme?.userAvatar : config.theme?.avatar"
        :src="isUser ? config.theme?.userAvatar : config.theme?.avatar"
        alt=""
      />
      <span v-else>{{ isUser ? '我' : 'AI' }}</span>
    </div>
    <div class="ac-msg__main">
      <div class="ac-msg__meta">
        <span class="ac-msg__time">{{ timeText }}</span>
        <MessageStatusBadge v-if="showStatus" :status="message.status" />
      </div>
      <div class="ac-msg__bubble">
        <template v-for="(block, i) in message.blocks" :key="i">
          <div v-if="block.type === 'text'" class="ac-msg__text">{{ block.text }}</div>
          <MarkdownRenderer v-else-if="block.type === 'markdown'" :content="block.content" />
          <CodeBlockRenderer v-else-if="block.type === 'code'" :block="block" />
          <TableRenderer v-else-if="block.type === 'table'" :block="block" />
          <ChartRenderer v-else-if="block.type === 'chart'" :block="block" />
          <FileCard
            v-else-if="block.type === 'file'"
            :block="block"
            @download="emit('fileDownload', $event)"
          />
          <DynamicForm
            v-else-if="block.type === 'form'"
            :block="block"
            :message-id="message.id"
            @submit="emit('formSubmit', $event)"
          />
          <ApprovalCard
            v-else-if="block.type === 'hitl'"
            :block="block"
            :message-id="message.id"
            @action="emit('hitlAction', $event)"
          />
          <ExecutionSteps
            v-else-if="block.type === 'steps'"
            :block="block"
            @open-trace="emit('openTrace', $event)"
          />
          <slot v-else-if="block.type === 'custom'" name="custom-block" :block="block" :message="message" />
        </template>

        <span
          v-if="message.status === 'streaming'"
          class="ac-msg__cursor"
        />

        <div v-if="message.attachments?.length" class="ac-msg__attachments">
          <span v-for="att in message.attachments" :key="att.id" class="ac-tag">[附件] {{ att.name }}</span>
        </div>

        <div v-if="message.status === 'failed'" class="ac-msg__error">
          {{ message.error || '执行失败' }}
        </div>
      </div>

      <div class="ac-msg__footer">
        <button
          v-if="message.status === 'failed'"
          class="ac-btn ac-btn--sm"
          type="button"
          @click="emit('retry', message.id)"
        >
          重试
        </button>
        <button
          v-if="!isUser && message.traceId"
          class="ac-btn ac-btn--text ac-btn--sm"
          type="button"
          @click="emit('openTrace', message.traceId!)"
        >
          Trace
        </button>
        <FeedbackBar
          v-if="!isUser && isFinished && message.status === 'completed' && config.enableFeedback !== false"
          :message="message"
          @feedback="emit('feedback', $event)"
          @correction="emit('correction', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style>
.ac-msg { display: flex; gap: 10px; padding: 8px 0; }
.ac-msg.is-user { flex-direction: row-reverse; }
.ac-msg__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ac-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  overflow: hidden;
}
.ac-msg.is-user .ac-msg__avatar { background: var(--ac-text-secondary); }
.ac-msg__avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-msg__main { max-width: 78%; min-width: 0; display: flex; flex-direction: column; }
.ac-msg.is-user .ac-msg__main { align-items: flex-end; }
.ac-msg__meta { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.ac-msg__time { font-size: 11px; color: var(--ac-text-secondary); }
.ac-msg__bubble {
  border-radius: var(--ac-radius);
  padding: 10px 14px;
  background: var(--ac-bg-soft);
  word-break: break-word;
}
.ac-msg.is-user .ac-msg__bubble { background: var(--ac-primary); color: #fff; }
.ac-msg.is-layout-document .ac-msg__bubble { background: transparent; padding: 0 2px; }
.ac-msg.is-layout-document.is-user .ac-msg__bubble { background: var(--ac-primary-soft); color: var(--ac-text); padding: 10px 14px; }
.ac-msg__text { white-space: pre-wrap; line-height: 1.6; }
.ac-msg__cursor {
  display: inline-block;
  width: 7px;
  height: 15px;
  background: var(--ac-primary);
  vertical-align: text-bottom;
  margin-left: 2px;
  animation: ac-blink 0.9s steps(1) infinite;
}
@keyframes ac-blink { 50% { opacity: 0; } }
.ac-msg__attachments { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.ac-msg__error { margin-top: 6px; font-size: 12.5px; color: var(--ac-danger); }
.ac-msg__footer { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
</style>
