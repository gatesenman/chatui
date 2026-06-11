<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Attachment, InputCapabilities, SendMessagePayload } from '../types'
import type { Locale } from '../i18n'
import { getLocale } from '../i18n'

const props = defineProps<{
  capabilities?: InputCapabilities
  placeholder?: string
  busy?: boolean
  allowStop?: boolean
  locale?: Locale
}>()

const emit = defineEmits<{
  send: [payload: SendMessagePayload]
  stop: []
  voiceStart: []
  voiceStop: []
}>()

const t = computed(() => props.locale ?? getLocale())

const text = ref('')
const attachments = ref<Attachment[]>([])
const recording = ref(false)
const fileInput = ref<HTMLInputElement>()
const textarea = ref<HTMLTextAreaElement>()

const caps = computed<Required<InputCapabilities>>(() => ({
  text: props.capabilities?.text ?? true,
  voice: props.capabilities?.voice ?? false,
  file: props.capabilities?.file ?? false,
  image: props.capabilities?.image ?? false
}))

const canSend = computed(
  () => !props.busy && (text.value.trim().length > 0 || attachments.value.length > 0)
)

const acceptTypes = computed(() => {
  if (caps.value.file) return undefined
  if (caps.value.image) return 'image/*'
  return undefined
})

function autoResize() {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

function send() {
  if (!canSend.value) return
  emit('send', {
    text: text.value.trim(),
    attachments: attachments.value.length ? [...attachments.value] : undefined,
    source: 'input'
  })
  text.value = ''
  attachments.value = []
  requestAnimationFrame(autoResize)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    send()
  }
}

function pickFile() {
  fileInput.value?.click()
}

function onFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) {
    attachments.value.push({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: f.size,
      mimeType: f.type,
      previewUrl: URL.createObjectURL(f)
    })
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeAttachment(id: string) {
  attachments.value = attachments.value.filter((a) => a.id !== id)
}

function toggleVoice() {
  recording.value = !recording.value
  if (recording.value) emit('voiceStart')
  else emit('voiceStop')
}

defineExpose({
  setText(v: string) {
    text.value = v
    requestAnimationFrame(autoResize)
  }
})
</script>

<template>
  <div class="ac-msginput">
    <div v-if="attachments.length" class="ac-msginput__attachments">
      <span v-for="att in attachments" :key="att.id" class="ac-msginput__tag">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        <span class="ac-msginput__tag-name">{{ att.name }}</span>
        <button class="ac-msginput__remove" type="button" :title="t.remove" @click="removeAttachment(att.id)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </span>
    </div>
    <div class="ac-msginput__box" :class="{ 'is-disabled': !caps.text }">
      <div class="ac-msginput__tools">
        <button
          v-if="caps.file || caps.image"
          class="ac-msginput__tool"
          type="button"
          :title="t.upload"
          @click="pickFile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <button
          v-if="caps.voice"
          class="ac-msginput__tool"
          :class="{ 'is-recording': recording }"
          type="button"
          :title="recording ? t.recording : t.voice"
          @click="toggleVoice"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </button>
        <input ref="fileInput" type="file" multiple hidden :accept="acceptTypes" @change="onFiles" />
      </div>
      <textarea
        v-if="caps.text"
        ref="textarea"
        v-model="text"
        class="ac-msginput__textarea"
        rows="1"
        :placeholder="placeholder || t.inputPlaceholder"
        @input="autoResize"
        @keydown="onKeydown"
      />
      <div v-else class="ac-msginput__disabled-hint">{{ t.textInputDisabled }}</div>
      <button
        v-if="busy && allowStop !== false"
        class="ac-msginput__send ac-msginput__send--stop"
        type="button"
        :title="t.stop"
        @click="emit('stop')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
      </button>
      <button
        v-else
        class="ac-msginput__send"
        type="button"
        :disabled="!canSend"
        :title="t.send"
        @click="send"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
    <div v-if="recording" class="ac-msginput__recording">
      <span class="ac-msginput__recording-dot"></span>
      {{ t.recording }}
    </div>
  </div>
</template>

<style>
.ac-msginput {
  padding: 10px 16px 14px;
  background: var(--ac-bg);
  border-top: 1px solid var(--ac-border);
}
.ac-msginput__attachments { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.ac-msginput__tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--ac-text-secondary);
  background: var(--ac-bg-soft);
  border: 1px solid var(--ac-border);
  border-radius: 8px;
  padding: 4px 8px;
  max-width: 240px;
}
.ac-msginput__tag-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ac-msginput__remove {
  border: none; background: none; cursor: pointer;
  color: var(--ac-text-tertiary); padding: 0; display: inline-flex;
  transition: color var(--ac-transition);
}
.ac-msginput__remove:hover { color: var(--ac-danger); }
.ac-msginput__box {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  border: 1px solid var(--ac-border);
  border-radius: 14px;
  padding: 6px 8px;
  background: var(--ac-bg);
  transition: border-color var(--ac-transition), box-shadow var(--ac-transition);
}
.ac-msginput__box:focus-within {
  border-color: var(--ac-primary);
  box-shadow: 0 0 0 3px var(--ac-primary-soft);
}
.ac-msginput__box.is-disabled { background: var(--ac-bg-soft); }
.ac-msginput__tools { display: flex; gap: 2px; }
.ac-msginput__tool {
  border: none; background: none; cursor: pointer;
  width: 34px; height: 34px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 9px;
  color: var(--ac-text-secondary);
  transition: background var(--ac-transition), color var(--ac-transition);
}
.ac-msginput__tool:hover { background: var(--ac-bg-hover); color: var(--ac-text); }
.ac-msginput__tool.is-recording { color: var(--ac-danger); }
.ac-msginput__textarea {
  flex: 1;
  resize: none;
  border: none;
  padding: 7px 4px;
  font-size: var(--ac-font-size);
  font-family: inherit;
  line-height: 1.5;
  outline: none;
  background: transparent;
  color: var(--ac-text);
  max-height: 160px;
  min-height: 34px;
  box-sizing: border-box;
}
.ac-msginput__disabled-hint { flex: 1; color: var(--ac-text-tertiary); font-size: 13px; padding: 8px 4px; }
.ac-msginput__send {
  border: none;
  cursor: pointer;
  width: 34px; height: 34px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 10px;
  background: var(--ac-primary);
  color: #fff;
  transition: background var(--ac-transition), transform var(--ac-transition), opacity var(--ac-transition);
  flex-shrink: 0;
}
.ac-msginput__send:hover:not(:disabled) { background: var(--ac-primary-hover); transform: scale(1.04); }
.ac-msginput__send:disabled { opacity: 0.35; cursor: default; }
.ac-msginput__send--stop { background: var(--ac-danger); }
.ac-msginput__send--stop:hover { background: #dc2626; }
.ac-msginput__recording {
  display: flex; align-items: center; gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--ac-danger);
}
.ac-msginput__recording-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--ac-danger);
  animation: ac-pulse 1.2s ease-in-out infinite;
}
</style>
