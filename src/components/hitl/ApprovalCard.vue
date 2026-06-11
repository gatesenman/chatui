<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { HitlActionPayload, HitlActionType, HitlBlock } from '../../types'
import type { Locale } from '../../i18n'
import { getLocale } from '../../i18n'

const props = defineProps<{ block: HitlBlock; messageId: string; locale?: Locale }>()

const t = computed(() => props.locale ?? getLocale())
const emit = defineEmits<{ action: [payload: HitlActionPayload] }>()

const resolved = ref(props.block.resolved ?? false)
const resolution = ref<HitlActionType | undefined>(props.block.resolution)
const mode = ref<'view' | 'modify' | 'reject' | 'supplement'>('view')
const comment = ref('')

const editValues = reactive<Record<string, unknown>>(
  Object.fromEntries(props.block.fields.map((f) => [f.key, f.value]))
)

const actionLabels = computed<Record<HitlActionType, string>>(() => ({
  approve: t.value.approve,
  reject: t.value.reject,
  modify: t.value.modify,
  supplement: t.value.supplement
}))

const resolutionText = computed(() => (resolution.value ? actionLabels.value[resolution.value] : ''))

function doAction(action: HitlActionType) {
  if (action === 'approve') {
    finish(action, {})
  } else if (action === 'modify') {
    mode.value = 'modify'
  } else if (action === 'reject') {
    mode.value = 'reject'
  } else {
    mode.value = 'supplement'
  }
}

function confirmModify() {
  finish('modify', { fields: { ...editValues } })
}

function confirmReject() {
  finish('reject', { comment: comment.value })
}

function confirmSupplement() {
  if (!comment.value.trim()) return
  finish('supplement', { comment: comment.value })
}

function finish(action: HitlActionType, extra: Partial<HitlActionPayload>) {
  resolved.value = true
  resolution.value = action
  emit('action', {
    taskId: props.block.taskId,
    messageId: props.messageId,
    action,
    ...extra
  })
}
</script>

<template>
  <div class="ac-hitl" :class="{ 'is-resolved': resolved }">
    <div class="ac-hitl__header">
      <span class="ac-hitl__badge">{{ resolved ? t.resolved : t.needConfirm }}</span>
      <span class="ac-hitl__title">{{ block.title }}</span>
    </div>
    <div v-if="block.description" class="ac-hitl__desc">{{ block.description }}</div>

    <div class="ac-hitl__fields">
      <div v-for="f in block.fields" :key="f.key" class="ac-hitl__field">
        <span class="ac-hitl__field-label">{{ f.label }}</span>
        <input
          v-if="mode === 'modify' && f.editable !== false && !resolved"
          class="ac-input ac-hitl__field-input"
          :value="String(editValues[f.key] ?? '')"
          @input="editValues[f.key] = ($event.target as HTMLInputElement).value"
        />
        <span v-else class="ac-hitl__field-value">{{ f.value }}</span>
      </div>
    </div>

    <template v-if="!resolved">
      <div v-if="mode === 'view'" class="ac-hitl__actions">
        <template v-for="action in block.actions" :key="action">
          <button
            class="ac-btn ac-btn--sm"
            :class="{ 'ac-btn--primary': action === 'approve', 'ac-btn--danger': action === 'reject' }"
            type="button"
            @click="doAction(action)"
          >
            {{ actionLabels[action] }}
          </button>
        </template>
      </div>
      <div v-else-if="mode === 'modify'" class="ac-hitl__actions">
        <button class="ac-btn ac-btn--sm" type="button" @click="mode = 'view'">{{ t.cancel }}</button>
        <button class="ac-btn ac-btn--sm ac-btn--primary" type="button" @click="confirmModify">{{ t.confirmModify }}</button>
      </div>
      <div v-else class="ac-hitl__comment">
        <textarea
          v-model="comment"
          class="ac-textarea"
          rows="2"
          :placeholder="mode === 'reject' ? t.rejectReasonPlaceholder : t.supplementPlaceholder"
        />
        <div class="ac-hitl__actions">
          <button class="ac-btn ac-btn--sm" type="button" @click="mode = 'view'">{{ t.cancel }}</button>
          <button
            class="ac-btn ac-btn--sm"
            :class="mode === 'reject' ? 'ac-btn--danger' : 'ac-btn--primary'"
            type="button"
            @click="mode === 'reject' ? confirmReject() : confirmSupplement()"
          >
            {{ mode === 'reject' ? t.confirmReject : t.submitSupplement }}
          </button>
        </div>
      </div>
    </template>
    <div v-else class="ac-hitl__resolved">
      <span
        class="ac-hitl__resolved-tag"
        :class="resolution === 'reject' ? 'is-reject' : 'is-approve'"
      >
        {{ resolutionText }}
      </span>
      <span v-if="block.resolutionComment" class="ac-hitl__resolved-comment">{{ block.resolutionComment }}</span>
    </div>
  </div>
</template>

<style>
.ac-hitl {
  border: 1px solid var(--ac-warning);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 6px 0;
  max-width: 460px;
  background: var(--ac-bg);
  box-shadow: var(--ac-shadow-sm);
  transition: border-color var(--ac-transition);
}
.ac-hitl.is-resolved { border-color: var(--ac-border); }
.ac-hitl__header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.ac-hitl__badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(217, 119, 6, 0.12);
  color: var(--ac-warning);
  flex-shrink: 0;
}
.ac-hitl.is-resolved .ac-hitl__badge { background: var(--ac-bg-soft); color: var(--ac-text-secondary); }
.ac-hitl__title { font-weight: 600; }
.ac-hitl__desc { font-size: 12.5px; color: var(--ac-text-secondary); margin-bottom: 8px; }
.ac-hitl__fields {
  background: var(--ac-bg-soft);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.ac-hitl__field { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.ac-hitl__field-label { color: var(--ac-text-secondary); min-width: 80px; flex-shrink: 0; }
.ac-hitl__field-input { flex: 1; }
.ac-hitl__actions { display: flex; gap: 8px; justify-content: flex-end; }
.ac-hitl__comment { display: flex; flex-direction: column; gap: 8px; }
.ac-hitl__resolved { display: flex; align-items: center; gap: 8px; }
.ac-hitl__resolved-tag { font-size: 12px; font-weight: 600; }
.ac-hitl__resolved-tag.is-approve { color: var(--ac-success); }
.ac-hitl__resolved-tag.is-reject { color: var(--ac-danger); }
.ac-hitl__resolved-comment { font-size: 12px; color: var(--ac-text-secondary); }
</style>
