<script setup lang="ts">
import type { ChatbotConfig, QuickAction } from '../types'

defineProps<{ config: ChatbotConfig }>()
const emit = defineEmits<{ quickAction: [action: QuickAction] }>()
</script>

<template>
  <div class="ac-welcome ac-fade-in">
    <div class="ac-welcome__avatar">
      <img v-if="config.theme?.avatar" :src="config.theme.avatar" alt="" />
      <span v-else>AI</span>
    </div>
    <h2 v-if="config.welcomeTitle" class="ac-welcome__title">{{ config.welcomeTitle }}</h2>
    <p v-if="config.welcomeMessage" class="ac-welcome__message">{{ config.welcomeMessage }}</p>
    <p v-if="config.agentDescription" class="ac-welcome__desc">{{ config.agentDescription }}</p>
    <div v-if="config.quickActions?.length" class="ac-welcome__actions">
      <button
        v-for="action in config.quickActions"
        :key="action.id"
        class="ac-welcome__action"
        type="button"
        :title="action.description"
        @click="emit('quickAction', action)"
      >
        <span v-if="action.icon" class="ac-welcome__action-icon">{{ action.icon }}</span>
        <span class="ac-welcome__action-label">{{ action.label }}</span>
        <span v-if="action.description" class="ac-welcome__action-desc">{{ action.description }}</span>
      </button>
    </div>
  </div>
</template>

<style>
.ac-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px 24px;
}
.ac-welcome__avatar {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--ac-primary), var(--ac-primary-hover));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  overflow: hidden;
  margin-bottom: 18px;
  box-shadow: var(--ac-shadow-lg);
}
.ac-welcome__avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-welcome__title { margin: 0 0 10px; font-size: 22px; font-weight: 600; color: var(--ac-text); }
.ac-welcome__message { margin: 0 0 6px; color: var(--ac-text); max-width: 520px; line-height: 1.6; }
.ac-welcome__desc { margin: 0; color: var(--ac-text-secondary); font-size: 13px; max-width: 520px; line-height: 1.6; }
.ac-welcome__actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, max-content));
  gap: 10px;
  justify-content: center;
  margin-top: 28px;
  max-width: 640px;
}
.ac-welcome__action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  border: 1px solid var(--ac-border);
  background: var(--ac-bg);
  color: var(--ac-text);
  border-radius: 12px;
  padding: 11px 16px;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: border-color var(--ac-transition), box-shadow var(--ac-transition), transform var(--ac-transition);
}
.ac-welcome__action:hover {
  border-color: var(--ac-primary);
  box-shadow: var(--ac-shadow-sm);
  transform: translateY(-1px);
}
.ac-welcome__action-icon { font-size: 12px; color: var(--ac-primary); font-weight: 600; }
.ac-welcome__action-label { font-weight: 500; }
.ac-welcome__action-desc { font-size: 12px; color: var(--ac-text-tertiary); }
</style>
