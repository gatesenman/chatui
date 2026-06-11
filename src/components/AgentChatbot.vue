<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type {
  ChatMessage,
  ChatSession,
  ChatbotConfig,
  CorrectionPayload,
  FeedbackPayload,
  FileBlock,
  FormSubmitPayload,
  HitlActionPayload,
  QuickAction,
  SendMessagePayload
} from '../types'
import SessionSidebar from './SessionSidebar.vue'
import WelcomeBlock from './WelcomeBlock.vue'
import MessageItem from './MessageItem.vue'
import MessageInput from './MessageInput.vue'

const props = defineProps<{
  config: ChatbotConfig
  messages: ChatMessage[]
  sessions?: ChatSession[]
  activeSessionId?: string | null
  /** Agent 是否正在执行（控制停止按钮 / 输入禁用） */
  busy?: boolean
}>()

const emit = defineEmits<{
  send: [payload: SendMessagePayload]
  stop: []
  retry: [messageId: string]
  sessionSelect: [sessionId: string]
  sessionCreate: []
  sessionRemove: [sessionId: string]
  sessionRename: [sessionId: string, title: string]
  hitlAction: [payload: HitlActionPayload]
  formSubmit: [payload: FormSubmitPayload]
  feedback: [payload: FeedbackPayload]
  correction: [payload: CorrectionPayload]
  openTrace: [traceId: string]
  fileDownload: [block: FileBlock]
  voiceStart: []
  voiceStop: []
}>()

const listRef = ref<HTMLElement>()
const inputRef = ref<InstanceType<typeof MessageInput>>()

const rootStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.config.theme?.primaryColor) {
    style['--ac-primary'] = props.config.theme.primaryColor
    style['--ac-primary-soft'] = `color-mix(in srgb, ${props.config.theme.primaryColor} 10%, transparent)`
  }
  return style
})

const isEmpty = computed(() => props.messages.length === 0)

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(
  () => [props.messages.length, props.messages[props.messages.length - 1]?.blocks.length],
  scrollToBottom,
  { deep: true }
)

function onQuickAction(action: QuickAction) {
  emit('send', { text: action.prompt, source: 'quick_action' })
}

defineExpose({
  scrollToBottom,
  setInputText(text: string) {
    inputRef.value?.setText(text)
  }
})
</script>

<template>
  <div class="ac-root" :class="{ 'ac-dark': config.theme?.dark }" :style="rootStyle">
    <SessionSidebar
      v-if="config.showSessions !== false && sessions"
      :sessions="sessions"
      :active-id="activeSessionId"
      @select="emit('sessionSelect', $event)"
      @create="emit('sessionCreate')"
      @remove="emit('sessionRemove', $event)"
      @rename="(id, title) => emit('sessionRename', id, title)"
    />
    <div class="ac-main">
      <header class="ac-header">
        <div class="ac-header__avatar">
          <img v-if="config.theme?.avatar" :src="config.theme.avatar" alt="" />
          <span v-else>AI</span>
        </div>
        <span class="ac-header__title">{{ config.theme?.title || 'AI 助手' }}</span>
        <slot name="header-extra" />
      </header>

      <div ref="listRef" class="ac-message-list">
        <WelcomeBlock v-if="isEmpty" :config="config" @quick-action="onQuickAction" />
        <template v-else>
          <MessageItem
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            :config="config"
            @retry="emit('retry', $event)"
            @hitl-action="emit('hitlAction', $event)"
            @form-submit="emit('formSubmit', $event)"
            @feedback="emit('feedback', $event)"
            @correction="emit('correction', $event)"
            @open-trace="emit('openTrace', $event)"
            @file-download="emit('fileDownload', $event)"
          >
            <template #custom-block="slotProps">
              <slot name="custom-block" v-bind="slotProps" />
            </template>
          </MessageItem>
        </template>
      </div>

      <div
        v-if="!isEmpty && config.quickActions?.length"
        class="ac-quick-actions"
      >
        <button
          v-for="action in config.quickActions"
          :key="action.id"
          class="ac-quick-actions__item"
          type="button"
          :title="action.description"
          @click="onQuickAction(action)"
        >
          <span v-if="action.icon">{{ action.icon }}</span>{{ action.label }}
        </button>
      </div>

      <MessageInput
        ref="inputRef"
        :capabilities="config.input"
        :placeholder="config.inputPlaceholder"
        :busy="busy"
        :allow-stop="config.allowStop"
        @send="emit('send', $event)"
        @stop="emit('stop')"
        @voice-start="emit('voiceStart')"
        @voice-stop="emit('voiceStop')"
      />
    </div>
  </div>
</template>

<style>
.ac-main { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.ac-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ac-border);
  flex-shrink: 0;
}
.ac-header__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--ac-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  overflow: hidden;
}
.ac-header__avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-header__title { font-weight: 600; font-size: 15px; }
.ac-message-list { flex: 1; overflow-y: auto; padding: 12px 20px; min-height: 0; }
.ac-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px 0;
}
.ac-quick-actions__item {
  border: 1px solid var(--ac-border);
  background: var(--ac-bg);
  color: var(--ac-text-secondary);
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.ac-quick-actions__item:hover { border-color: var(--ac-primary); color: var(--ac-primary); }
</style>
