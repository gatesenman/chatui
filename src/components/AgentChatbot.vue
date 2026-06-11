<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ChatMessage, ChatSession, ChatbotConfig, SendMessagePayload, HitlActionPayload, FormSubmitPayload, FeedbackPayload, CorrectionPayload } from '../types'
import { getLocale } from '../i18n'
import SessionSidebar from './SessionSidebar.vue'
import WelcomeBlock from './WelcomeBlock.vue'
import MessageItem from './MessageItem.vue'
import MessageInput from './MessageInput.vue'

const props = withDefaults(defineProps<{
  config: ChatbotConfig
  messages: ChatMessage[]
  sessions?: ChatSession[]
  activeSessionId?: string | null
  busy?: boolean
}>(), { sessions: () => [], activeSessionId: null, busy: false })

const emit = defineEmits<{
  send: [payload: SendMessagePayload]
  stop: []
  retry: [messageId: string]
  'session-select': [id: string]
  'session-create': []
  'session-remove': [id: string]
  'session-rename': [id: string, title: string]
  'hitl-action': [payload: HitlActionPayload]
  'form-submit': [payload: FormSubmitPayload]
  feedback: [payload: FeedbackPayload]
  correction: [payload: CorrectionPayload]
  'open-trace': [traceId: string]
  'file-download': [url: string, name: string]
  'voice-start': []
  'voice-stop': []
}>()

const locale = computed(() => getLocale(props.config.locale))
const theme = computed(() => props.config.theme ?? {})
const showSessions = computed(() => props.config.showSessions !== false)

const listRef = ref<HTMLDivElement | null>(null)
const showScrollBtn = ref(false)
const isNearBottom = ref(true)

function checkNearBottom() {
  const el = listRef.value
  if (!el) return
  const threshold = 100
  isNearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  showScrollBtn.value = !isNearBottom.value && (props.config.showScrollToBottom !== false)
}

function scrollToBottom(smooth = true) {
  const el = listRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}

function autoScroll() {
  const strategy = props.config.autoScrollStrategy ?? 'smart'
  if (strategy === 'never') return
  if (strategy === 'always' || isNearBottom.value) {
    nextTick(() => scrollToBottom(true))
  }
}

watch(() => props.messages.length, autoScroll)
watch(() => {
  const last = props.messages[props.messages.length - 1]
  return last?.blocks.length
}, autoScroll)

onMounted(() => {
  listRef.value?.addEventListener('scroll', checkNearBottom, { passive: true })
  nextTick(() => scrollToBottom(false))
})
onUnmounted(() => {
  listRef.value?.removeEventListener('scroll', checkNearBottom)
})

const rootClasses = computed(() => {
  const cls = ['ac-root']
  if (theme.value.dark) cls.push('ac-dark')
  if (theme.value.customScrollbar !== false) cls.push('ac-custom-scroll')
  if (theme.value.backgroundImage) cls.push('ac-has-bg')
  if (props.config.className?.root) cls.push(props.config.className.root)
  return cls
})

const rootStyle = computed(() => {
  const s: Record<string, string> = {}
  if (theme.value.primaryColor) {
    s['--ac-primary'] = theme.value.primaryColor
  }
  if (theme.value.sidebarWidth) s['--ac-sidebar-width'] = `${theme.value.sidebarWidth}px`
  if (theme.value.headerHeight) s['--ac-header-height'] = `${theme.value.headerHeight}px`
  if (theme.value.avatarSize) s['--ac-avatar-size'] = `${theme.value.avatarSize}px`
  if (theme.value.bubbleRadius) s['--ac-bubble-radius'] = `${theme.value.bubbleRadius}px`
  if (theme.value.fontSize) s['--ac-font-size'] = `${theme.value.fontSize}px`
  if (theme.value.messageGap) s['--ac-message-gap'] = `${theme.value.messageGap}px`
  if (theme.value.maxMessageWidth) s['--ac-max-message-width'] = `${theme.value.maxMessageWidth}px`
  if (theme.value.borderRadius != null) s['--ac-radius'] = `${theme.value.borderRadius}px`
  if (theme.value.userBubbleColor) s['--ac-user-bubble'] = theme.value.userBubbleColor
  if (theme.value.assistantBubbleColor) s['--ac-assistant-bubble'] = theme.value.assistantBubbleColor
  if (theme.value.backgroundImage) s['background-image'] = `url(${theme.value.backgroundImage})`
  return s
})

const isTyping = computed(() => {
  if (props.config.showTypingIndicator === false) return false
  const last = props.messages[props.messages.length - 1]
  return last?.role === 'assistant' && ['pending', 'thinking'].includes(last.status)
})

function shouldShowTimestamp(idx: number): boolean {
  if (props.config.timestampFormat === 'hidden') return false
  const interval = props.config.messageGroupInterval ?? 5
  if (interval === 0) return true
  if (idx === 0) return true
  const prev = props.messages[idx - 1]
  const curr = props.messages[idx]
  return curr.createdAt - prev.createdAt > interval * 60 * 1000
}

function formatTimestamp(ts: number): string {
  const fmt = props.config.timestampFormat ?? 'time'
  const d = new Date(ts)
  if (fmt === 'relative') {
    const diff = Date.now() - ts
    if (diff < 60000) return locale.value.justNow
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`
    return d.toLocaleDateString()
  }
  if (fmt === 'datetime') {
    return d.toLocaleString()
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div :class="rootClasses" :style="rootStyle">
    <!-- Sidebar -->
    <SessionSidebar
      v-if="showSessions"
      :sessions="sessions"
      :active-id="activeSessionId"
      :locale="locale"
      :class="config.className?.sidebar"
      @select="emit('session-select', $event)"
      @create="emit('session-create')"
      @remove="emit('session-remove', $event)"
      @rename="(id: string, title: string) => emit('session-rename', id, title)"
    />

    <!-- Main area -->
    <div class="ac-main">
      <!-- Header -->
      <header class="ac-header" :class="config.className?.header">
        <div class="ac-header__avatar" :class="`ac-avatar--${theme.avatarShape ?? 'circle'}`">
          <img v-if="theme.avatar" :src="theme.avatar" alt="" />
          <span v-else class="ac-header__avatar-fallback">A</span>
        </div>
        <div class="ac-header__info">
          <span class="ac-header__title">{{ theme.title || 'Agent' }}</span>
          <span v-if="busy" class="ac-header__status ac-header__status--active">
            <span class="ac-header__status-dot"></span>
            {{ locale.running }}
          </span>
        </div>
      </header>

      <!-- Message list -->
      <div ref="listRef" class="ac-messages" :class="config.className?.messageList">
        <div class="ac-messages__inner">
          <!-- Welcome -->
          <WelcomeBlock
            v-if="!messages.length"
            :config="config"
            :locale="locale"
            @quick-action="emit('send', { text: $event.prompt, source: 'quick_action' })"
          />

          <!-- Messages -->
          <template v-for="(msg, idx) in messages" :key="msg.id">
            <div v-if="shouldShowTimestamp(idx)" class="ac-messages__timestamp">
              {{ formatTimestamp(msg.createdAt) }}
            </div>
            <MessageItem
              :message="msg"
              :config="config"
              :locale="locale"
              :theme="theme"
              class="ac-msg-enter"
              @retry="emit('retry', msg.id)"
              @hitl-action="emit('hitl-action', $event)"
              @form-submit="emit('form-submit', $event)"
              @feedback="emit('feedback', $event)"
              @correction="emit('correction', $event)"
              @open-trace="emit('open-trace', $event)"
              @file-download="emit('file-download', $event.url ?? '', $event.name)"
            />
          </template>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="ac-messages__typing ac-msg-enter">
            <div class="ac-messages__typing-bubble">
              <span class="ac-typing">
                <span class="ac-typing__dot"></span>
                <span class="ac-typing__dot"></span>
                <span class="ac-typing__dot"></span>
              </span>
            </div>
          </div>
        </div>

        <!-- Scroll to bottom button -->
        <Transition name="ac-fade">
          <button
            v-if="showScrollBtn"
            class="ac-messages__scroll-btn"
            type="button"
            :title="locale.scrollToBottom"
            @click="scrollToBottom()"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </Transition>
      </div>

      <!-- Input -->
      <MessageInput
        :capabilities="config.input"
        :placeholder="config.inputPlaceholder"
        :allow-stop="config.allowStop"
        :busy="busy"
        :locale="locale"
        :class="config.className?.input"
        @send="emit('send', $event)"
        @stop="emit('stop')"
        @voice-start="emit('voice-start')"
        @voice-stop="emit('voice-stop')"
      />
    </div>
  </div>
</template>

<style>
.ac-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

/* Header */
.ac-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: var(--ac-header-height);
  border-bottom: 1px solid var(--ac-border);
  background: var(--ac-bg);
  flex-shrink: 0;
}
.ac-header__avatar {
  width: var(--ac-avatar-size);
  height: var(--ac-avatar-size);
  flex-shrink: 0;
  overflow: hidden;
  background: var(--ac-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ac-avatar--circle { border-radius: 50%; }
.ac-avatar--square { border-radius: 4px; }
.ac-avatar--rounded { border-radius: var(--ac-radius-sm); }
.ac-header__avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-header__avatar-fallback { font-weight: 600; color: var(--ac-primary); font-size: 15px; }
.ac-header__info { display: flex; flex-direction: column; gap: 1px; }
.ac-header__title { font-weight: 600; font-size: 15px; }
.ac-header__status { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--ac-text-secondary); }
.ac-header__status--active { color: var(--ac-success); }
.ac-header__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ac-success);
  animation: ac-pulse 1.5s infinite;
}

/* Messages area */
.ac-messages {
  flex: 1;
  overflow-y: auto;
  position: relative;
  min-height: 0;
}
.ac-messages__inner {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: var(--ac-message-gap);
  min-height: 100%;
}
.ac-messages__timestamp {
  text-align: center;
  font-size: 12px;
  color: var(--ac-text-tertiary);
  padding: 4px 0;
  user-select: none;
}
.ac-messages__typing { align-self: flex-start; }
.ac-messages__typing-bubble {
  display: inline-flex;
  padding: 10px 16px;
  border-radius: var(--ac-bubble-radius);
  background: var(--ac-assistant-bubble);
  box-shadow: var(--ac-shadow-sm);
}
.ac-messages__scroll-btn {
  position: sticky;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--ac-border);
  background: var(--ac-bg);
  box-shadow: var(--ac-shadow);
  cursor: pointer;
  color: var(--ac-text-secondary);
  transition: all var(--ac-transition);
  z-index: 5;
}
.ac-messages__scroll-btn:hover {
  border-color: var(--ac-primary);
  color: var(--ac-primary);
  box-shadow: var(--ac-shadow-lg);
}

/* Transitions */
.ac-fade-enter-active, .ac-fade-leave-active { transition: opacity 0.2s ease; }
.ac-fade-enter-from, .ac-fade-leave-to { opacity: 0; }
</style>
