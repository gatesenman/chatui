<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Attachment, InputCapabilities, SendMessagePayload } from '../types'

const props = defineProps<{
  capabilities?: InputCapabilities
  placeholder?: string
  busy?: boolean
  allowStop?: boolean
}>()

const emit = defineEmits<{
  send: [payload: SendMessagePayload]
  stop: []
  voiceStart: []
  voiceStop: []
}>()

const text = ref('')
const attachments = ref<Attachment[]>([])
const recording = ref(false)
const fileInput = ref<HTMLInputElement>()

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

function send() {
  if (!canSend.value) return
  emit('send', {
    text: text.value.trim(),
    attachments: attachments.value.length ? [...attachments.value] : undefined,
    source: 'input'
  })
  text.value = ''
  attachments.value = []
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
  }
})
</script>

<template>
  <div class="ac-msginput">
    <div v-if="attachments.length" class="ac-msginput__attachments">
      <span v-for="att in attachments" :key="att.id" class="ac-tag">
        [附件] {{ att.name }}
        <button class="ac-msginput__remove" type="button" @click="removeAttachment(att.id)">x</button>
      </span>
    </div>
    <div class="ac-msginput__row">
      <div class="ac-msginput__tools">
        <button
          v-if="caps.file || caps.image"
          class="ac-btn ac-btn--text"
          type="button"
          title="上传文件"
          @click="pickFile"
        >
          [上传]
        </button>
        <button
          v-if="caps.voice"
          class="ac-btn ac-btn--text"
          :class="{ 'is-recording': recording }"
          type="button"
          :title="recording ? '停止录音' : '语音输入'"
          @click="toggleVoice"
        >
          {{ recording ? '[录音中]' : '[语音]' }}
        </button>
        <input ref="fileInput" type="file" multiple hidden :accept="acceptTypes" @change="onFiles" />
      </div>
      <textarea
        v-if="caps.text"
        v-model="text"
        class="ac-msginput__textarea"
        rows="1"
        :placeholder="placeholder || '请输入消息，Enter 发送，Shift+Enter 换行'"
        @keydown="onKeydown"
      />
      <div v-else class="ac-msginput__disabled-hint">文本输入已关闭</div>
      <button
        v-if="busy && allowStop !== false"
        class="ac-btn ac-btn--danger"
        type="button"
        @click="emit('stop')"
      >
        [停止]
      </button>
      <button v-else class="ac-btn ac-btn--primary" type="button" :disabled="!canSend" @click="send">
        发送
      </button>
    </div>
  </div>
</template>

<style>
.ac-msginput {
  border-top: 1px solid var(--ac-border);
  padding: 10px 16px 14px;
  background: var(--ac-bg);
}
.ac-msginput__attachments { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.ac-msginput__remove { border: none; background: none; cursor: pointer; color: var(--ac-text-secondary); padding: 0 0 0 2px; }
.ac-msginput__row { display: flex; align-items: flex-end; gap: 8px; }
.ac-msginput__tools { display: flex; }
.ac-msginput__tools .is-recording { color: var(--ac-danger); animation: ac-blink 1s steps(1) infinite; }
.ac-msginput__textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--ac-border);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: var(--ac-bg);
  color: var(--ac-text);
  max-height: 120px;
  min-height: 38px;
  box-sizing: border-box;
}
.ac-msginput__textarea:focus { border-color: var(--ac-primary); }
.ac-msginput__disabled-hint { flex: 1; color: var(--ac-text-secondary); font-size: 13px; padding: 9px 0; }
</style>
