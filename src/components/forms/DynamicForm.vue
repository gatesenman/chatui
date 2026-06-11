<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormBlock, FormFieldSchema, FormSubmitPayload } from '../../types'
import FormFields from './FormFields.vue'

const props = defineProps<{ block: FormBlock; messageId: string }>()
const emit = defineEmits<{ submit: [payload: FormSubmitPayload] }>()

const isMultiStep = computed(() => props.block.steps.length > 1)
const currentStep = ref(0)
const submitted = ref(props.block.submitted ?? false)

const values = reactive<Record<string, unknown>>({ ...(props.block.values ?? {}) })
for (const step of props.block.steps) {
  for (const f of step.fields) {
    if (!(f.key in values) && f.defaultValue !== undefined) values[f.key] = f.defaultValue
  }
}

const errors = reactive<Record<string, string>>({})

function validateFields(fields: FormFieldSchema[]): boolean {
  let ok = true
  for (const f of fields) {
    delete errors[f.key]
    const v = values[f.key]
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
    if (f.required && empty) {
      errors[f.key] = `${f.label}为必填项`
      ok = false
      continue
    }
    if (!empty && f.pattern && typeof v === 'string' && !new RegExp(f.pattern).test(v)) {
      errors[f.key] = f.patternMessage || `${f.label}格式不正确`
      ok = false
    }
    if (!empty && typeof v === 'number') {
      if (f.min !== undefined && v < f.min) { errors[f.key] = `${f.label}不能小于${f.min}`; ok = false }
      if (f.max !== undefined && v > f.max) { errors[f.key] = `${f.label}不能大于${f.max}`; ok = false }
    }
  }
  return ok
}

function onUpdate(key: string, value: unknown) {
  values[key] = value
  delete errors[key]
}

function nextStep() {
  if (!validateFields(props.block.steps[currentStep.value].fields)) return
  if (currentStep.value < props.block.steps.length - 1) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function submit() {
  if (!validateFields(props.block.steps[currentStep.value].fields)) return
  submitted.value = true
  emit('submit', {
    formId: props.block.formId,
    messageId: props.messageId,
    values: { ...values },
    step: isMultiStep.value ? currentStep.value : undefined
  })
}

const allFields = computed(() => props.block.steps.flatMap((s) => s.fields))

function displayValue(f: FormFieldSchema): string {
  const v = values[f.key]
  if (v === undefined || v === null || v === '') return '-'
  if (f.options) {
    const arr = Array.isArray(v) ? v : [v]
    return arr.map((x) => f.options!.find((o) => o.value === x)?.label ?? String(x)).join('、')
  }
  if (typeof v === 'boolean') return v ? '是' : '否'
  return String(v)
}
</script>

<template>
  <div class="ac-form">
    <div v-if="block.title" class="ac-form__title">{{ block.title }}</div>
    <div v-if="block.description" class="ac-form__desc">{{ block.description }}</div>

    <template v-if="!submitted">
      <div v-if="isMultiStep" class="ac-form__stepbar">
        <div
          v-for="(step, i) in block.steps"
          :key="i"
          class="ac-form__step"
          :class="{ 'is-active': i === currentStep, 'is-done': i < currentStep }"
        >
          <span class="ac-form__step-index">{{ i < currentStep ? 'OK' : i + 1 }}</span>
          <span class="ac-form__step-title">{{ step.title }}</span>
        </div>
      </div>
      <div v-if="isMultiStep && block.steps[currentStep].description" class="ac-form__desc">
        {{ block.steps[currentStep].description }}
      </div>

      <FormFields
        :fields="block.steps[currentStep].fields"
        :values="values"
        :errors="errors"
        @update="onUpdate"
      />

      <div class="ac-form__actions">
        <button v-if="isMultiStep && currentStep > 0" class="ac-btn" type="button" @click="prevStep">
          上一步
        </button>
        <button
          v-if="isMultiStep && currentStep < block.steps.length - 1"
          class="ac-btn ac-btn--primary"
          type="button"
          @click="nextStep"
        >
          下一步
        </button>
        <button v-else class="ac-btn ac-btn--primary" type="button" @click="submit">
          {{ block.submitText || '提交' }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="ac-form__summary">
        <div v-for="f in allFields" :key="f.key" class="ac-form__summary-row">
          <span class="ac-form__summary-label">{{ f.label }}</span>
          <span class="ac-form__summary-value">{{ displayValue(f) }}</span>
        </div>
      </div>
      <div class="ac-form__submitted-tag">已提交</div>
    </template>
  </div>
</template>

<style>
.ac-form {
  border: 1px solid var(--ac-border);
  border-radius: 10px;
  padding: 14px;
  margin: 4px 0;
  max-width: 460px;
  background: var(--ac-bg);
}
.ac-form__title { font-weight: 600; margin-bottom: 4px; }
.ac-form__desc { font-size: 12.5px; color: var(--ac-text-secondary); margin-bottom: 12px; }
.ac-form__stepbar { display: flex; gap: 4px; margin-bottom: 14px; }
.ac-form__step { display: flex; align-items: center; gap: 6px; flex: 1; font-size: 12px; color: var(--ac-text-secondary); }
.ac-form__step-index {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ac-bg-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
}
.ac-form__step.is-active { color: var(--ac-primary); font-weight: 600; }
.ac-form__step.is-active .ac-form__step-index { background: var(--ac-primary); color: #fff; }
.ac-form__step.is-done .ac-form__step-index { background: var(--ac-success); color: #fff; }
.ac-form__actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
.ac-form__summary { display: flex; flex-direction: column; gap: 6px; }
.ac-form__summary-row { display: flex; font-size: 13px; gap: 10px; }
.ac-form__summary-label { color: var(--ac-text-secondary); min-width: 90px; }
.ac-form__submitted-tag { margin-top: 10px; font-size: 12px; color: var(--ac-success); }
</style>
