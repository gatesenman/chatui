<script setup lang="ts">
import type { ChatbotConfig, QuickAction } from '../types'

defineProps<{ config: ChatbotConfig }>()
const emit = defineEmits<{ quickAction: [action: QuickAction] }>()
</script>

<template>
  <div class="ac-welcome">
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
        {{ action.label }}
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
  padding: 48px 24px 24px;
}
.ac-welcome__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ac-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  overflow: hidden;
  margin-bottom: 14px;
}
.ac-welcome__avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-welcome__title { margin: 0 0 8px; font-size: 20px; }
.ac-welcome__message { margin: 0 0 4px; color: var(--ac-text); max-width: 480px; }
.ac-welcome__desc { margin: 0; color: var(--ac-text-secondary); font-size: 13px; max-width: 480px; }
.ac-welcome__actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 22px; }
.ac-welcome__action {
  border: 1px solid var(--ac-border);
  background: var(--ac-bg);
  color: var(--ac-text);
  border-radius: 10px;
  padding: 9px 16px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}
.ac-welcome__action:hover { border-color: var(--ac-primary); color: var(--ac-primary); }
.ac-welcome__action-icon { margin-right: 5px; }
</style>
