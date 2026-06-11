<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatMessage, CorrectionPayload, FeedbackPayload } from '../types'
import type { Locale } from '../i18n'
import { getLocale } from '../i18n'

const props = defineProps<{ message: ChatMessage; locale?: Locale }>()
const emit = defineEmits<{
  feedback: [payload: FeedbackPayload]
  correction: [payload: CorrectionPayload]
}>()

const t = computed(() => props.locale ?? getLocale())

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
        class="ac-feedback__btn"
        :class="{ 'is-active': message.feedback === 'like' }"
        type="button"
        :title="t.like"
        @click="toggle('like')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
      </button>
      <button
        class="ac-feedback__btn"
        :class="{ 'is-active is-dislike': message.feedback === 'dislike' }"
        type="button"
        :title="t.dislike"
        @click="toggle('dislike')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
      </button>
      <button
        v-if="!correctionSent"
        class="ac-feedback__btn ac-feedback__btn--label"
        type="button"
        @click="showCorrection = !showCorrection"
      >
        {{ t.submitCorrection }}
      </button>
      <span v-else class="ac-feedback__sent">{{ t.correctionSent }}</span>
    </div>
    <div v-if="showCorrection && !correctionSent" class="ac-feedback__correction ac-fade-in">
      <textarea
        v-model="correctionText"
        class="ac-textarea"
        rows="2"
        :placeholder="t.correctionPlaceholder"
      />
      <div class="ac-feedback__correction-actions">
        <button class="ac-btn ac-btn--sm" type="button" @click="showCorrection = false">{{ t.cancel }}</button>
        <button class="ac-btn ac-btn--sm ac-btn--primary" type="button" @click="submitCorrection">{{ t.submit }}</button>
      </div>
    </div>
  </div>
</template>

<style>
.ac-feedback { margin-top: 4px; }
.ac-feedback__buttons { display: flex; align-items: center; gap: 2px; }
.ac-feedback__btn {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--ac-text-tertiary);
  padding: 5px 6px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-family: inherit;
  transition: background var(--ac-transition), color var(--ac-transition);
}
.ac-feedback__btn:hover { background: var(--ac-bg-hover); color: var(--ac-text); }
.ac-feedback__btn.is-active { color: var(--ac-primary); background: var(--ac-primary-soft); }
.ac-feedback__btn.is-dislike { color: var(--ac-danger); background: rgba(239, 68, 68, 0.08); }
.ac-feedback__btn--label { font-size: 12px; }
.ac-feedback__sent { font-size: 12px; color: var(--ac-success); padding: 0 6px; }
.ac-feedback__correction { margin-top: 6px; max-width: 420px; display: flex; flex-direction: column; gap: 6px; }
.ac-feedback__correction-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
