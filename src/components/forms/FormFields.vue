<script setup lang="ts">
import type { FormFieldSchema } from '../../types'

defineProps<{
  fields: FormFieldSchema[]
  values: Record<string, unknown>
  errors: Record<string, string>
  disabled?: boolean
}>()

const emit = defineEmits<{ update: [key: string, value: unknown] }>()

function onInput(key: string, value: unknown) {
  emit('update', key, value)
}
</script>

<template>
  <div class="ac-form-fields">
    <div v-for="field in fields" :key="field.key" class="ac-form-field">
      <label class="ac-form-field__label">
        <span v-if="field.required" class="ac-form-field__required">*</span>{{ field.label }}
      </label>

      <input
        v-if="field.widget === 'input'"
        class="ac-input"
        type="text"
        :placeholder="field.placeholder"
        :value="(values[field.key] as string) ?? ''"
        :disabled="disabled"
        @input="onInput(field.key, ($event.target as HTMLInputElement).value)"
      />
      <textarea
        v-else-if="field.widget === 'textarea'"
        class="ac-textarea"
        rows="3"
        :placeholder="field.placeholder"
        :value="(values[field.key] as string) ?? ''"
        :disabled="disabled"
        @input="onInput(field.key, ($event.target as HTMLTextAreaElement).value)"
      />
      <input
        v-else-if="field.widget === 'number'"
        class="ac-input"
        type="number"
        :placeholder="field.placeholder"
        :min="field.min"
        :max="field.max"
        :value="(values[field.key] as number) ?? ''"
        :disabled="disabled"
        @input="onInput(field.key, ($event.target as HTMLInputElement).valueAsNumber)"
      />
      <input
        v-else-if="field.widget === 'date'"
        class="ac-input"
        type="date"
        :value="(values[field.key] as string) ?? ''"
        :disabled="disabled"
        @input="onInput(field.key, ($event.target as HTMLInputElement).value)"
      />
      <select
        v-else-if="field.widget === 'select'"
        class="ac-select"
        :value="String(values[field.key] ?? '')"
        :disabled="disabled"
        @change="onInput(field.key, ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>{{ field.placeholder || '请选择' }}</option>
        <option v-for="opt in field.options" :key="String(opt.value)" :value="String(opt.value)">
          {{ opt.label }}
        </option>
      </select>
      <div v-else-if="field.widget === 'radio'" class="ac-form-field__options">
        <label v-for="opt in field.options" :key="String(opt.value)" class="ac-form-field__option">
          <input
            type="radio"
            :name="field.key"
            :checked="values[field.key] === opt.value"
            :disabled="disabled"
            @change="onInput(field.key, opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
      <div v-else-if="field.widget === 'checkbox'" class="ac-form-field__options">
        <label v-for="opt in field.options" :key="String(opt.value)" class="ac-form-field__option">
          <input
            type="checkbox"
            :checked="Array.isArray(values[field.key]) && (values[field.key] as unknown[]).includes(opt.value)"
            :disabled="disabled"
            @change="
              () => {
                const cur = Array.isArray(values[field.key]) ? [...(values[field.key] as unknown[])] : []
                const idx = cur.indexOf(opt.value)
                if (idx >= 0) cur.splice(idx, 1)
                else cur.push(opt.value)
                onInput(field.key, cur)
              }
            "
          />
          {{ opt.label }}
        </label>
      </div>
      <label v-else-if="field.widget === 'switch'" class="ac-form-field__option">
        <input
          type="checkbox"
          :checked="Boolean(values[field.key])"
          :disabled="disabled"
          @change="onInput(field.key, ($event.target as HTMLInputElement).checked)"
        />
        {{ field.placeholder || '开启' }}
      </label>

      <div v-if="field.helpText" class="ac-form-field__help">{{ field.helpText }}</div>
      <div v-if="errors[field.key]" class="ac-form-field__error">{{ errors[field.key] }}</div>
    </div>
  </div>
</template>

<style>
.ac-form-fields { display: flex; flex-direction: column; gap: 12px; }
.ac-form-field__label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: 500; }
.ac-form-field__required { color: var(--ac-danger); margin-right: 2px; }
.ac-form-field__options { display: flex; flex-wrap: wrap; gap: 12px; }
.ac-form-field__option { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer; }
.ac-form-field__help { font-size: 12px; color: var(--ac-text-secondary); margin-top: 3px; }
.ac-form-field__error { font-size: 12px; color: var(--ac-danger); margin-top: 3px; }
</style>
