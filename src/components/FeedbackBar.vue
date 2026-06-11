<script setup lang="ts">
import { ref } from 'vue'
import type { ChatMessage, CorrectionPayload, FeedbackPayload } from '../types'

const props = defineProps<{ message: ChatMessage }>()
const emit = defineEmits<{
  feedback: [payload: FeedbackPayload]
  correction: [payload: CorrectionPayload]
}>()

const showCorrection = ref(false)
const correctionText = ref('')
const correctionSent = ref(Boolean(props.message.correction))

function toggle(value: 'like' | 'dislike') {
  const next = props.message.feedback === value ? null : value
  emit('feedback', { messageId: props.message.id, feedback: next })
  if (next === 'dislike') showCorrection.value = true
}

function submitCorrection() {
  if (!correctionText.value.trim()) return
  emit('correction', { messageId: props.message.id, correction: correctionText.value })
  correctionSent.value = true
  showCorrection.value = false
}
</script>

<template>
  <div class="ac-feedback">
    <div class="ac-feedback__buttons">
      <button
        class="ac-btn ac-btn--text ac-btn--sm"
        :class="{ 'is-active': message.feedback === 'like' }"
        type="button"
        title="赞"
        @click="toggle('like')"
      >
        [赞]
      </button>
      <button
        class="ac-btn ac-btn--text ac-btn--sm"
        :class="{ 'is-active': message.feedback === 'dislike' }"
        type="button"
        title="踩"
        @click="toggle('dislike')"
      >
        [踩]
      </button>
      <button
        v-if="!correctionSent"
        class="ac-btn ac-btn--text ac-btn--sm"
        type="button"
        @click="showCorrection = !showCorrection"
      >
        提交修正
      </button>
      <span v-else class="ac-feedback__sent">修正已提交</span>
    </div>
    <div v-if="showCorrection && !correctionSent" class="ac-feedback__correction">
      <textarea
        v-model="correctionText"
        class="ac-textarea"
        rows="2"
        placeholder="请输入正确答案或修改建议"
      />
      <div class="ac-feedback__correction-actions">
        <button class="ac-btn ac-btn--sm" type="button" @click="showCorrection = false">取消</button>
        <button class="ac-btn ac-btn--sm ac-btn--primary" type="button" @click="submitCorrection">提交</button>
      </div>
    </div>
  </div>
</template>

<style>
.ac-feedback { margin-top: 4px; }
.ac-feedback__buttons { display: flex; align-items: center; gap: 2px; }
.ac-feedback__buttons .is-active { background: var(--ac-primary-soft); border-radius: 6px; }
.ac-feedback__sent { font-size: 12px; color: var(--ac-success); }
.ac-feedback__correction { margin-top: 6px; max-width: 420px; display: flex; flex-direction: column; gap: 6px; }
.ac-feedback__correction-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
