<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatSession } from '../types'
import type { Locale } from '../i18n'
import { getLocale } from '../i18n'

const props = defineProps<{ sessions: ChatSession[]; activeId?: string | null; locale?: Locale }>()
const emit = defineEmits<{
  select: [sessionId: string]
  create: []
  remove: [sessionId: string]
  rename: [sessionId: string, title: string]
}>()

const t = computed(() => props.locale ?? getLocale())

const keyword = ref('')
const editingId = ref<string | null>(null)
const editingTitle = ref('')

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  const list = [...props.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
  if (!k) return list
  return list.filter((s) => s.title.toLowerCase().includes(k))
})

function startRename(s: ChatSession) {
  editingId.value = s.id
  editingTitle.value = s.title
}

function confirmRename() {
  if (editingId.value && editingTitle.value.trim()) {
    emit('rename', editingId.value, editingTitle.value.trim())
  }
  editingId.value = null
}
</script>

<template>
  <aside class="ac-sidebar">
    <button class="ac-sidebar__new" type="button" @click="emit('create')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {{ t.newSession }}
    </button>
    <div class="ac-sidebar__search-box">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="keyword" class="ac-sidebar__search" :placeholder="t.searchSessions" />
    </div>
    <ul class="ac-sidebar__list ac-custom-scroll">
      <li
        v-for="s in filtered"
        :key="s.id"
        class="ac-sidebar__item"
        :class="{ 'is-active': s.id === activeId }"
        @click="emit('select', s.id)"
      >
        <template v-if="editingId === s.id">
          <input
            v-model="editingTitle"
            class="ac-input ac-sidebar__rename"
            @click.stop
            @keydown.enter="confirmRename"
            @blur="confirmRename"
          />
        </template>
        <template v-else>
          <span class="ac-sidebar__title" :title="s.title">{{ s.title }}</span>
          <span class="ac-sidebar__ops">
            <button class="ac-sidebar__op" type="button" :title="t.rename" @click.stop="startRename(s)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="ac-sidebar__op ac-sidebar__op--danger" type="button" :title="t.deleteSession" @click.stop="emit('remove', s.id)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </span>
        </template>
      </li>
      <li v-if="!filtered.length" class="ac-sidebar__empty">{{ t.noSessions }}</li>
    </ul>
  </aside>
</template>

<style>
.ac-sidebar {
  width: var(--ac-sidebar-width, 240px);
  flex-shrink: 0;
  border-right: 1px solid var(--ac-border);
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 10px;
  background: var(--ac-bg-soft);
  min-height: 0;
}
.ac-sidebar__new {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  background: var(--ac-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 12px;
  border-radius: 10px;
  transition: background var(--ac-transition), transform var(--ac-transition);
}
.ac-sidebar__new:hover { background: var(--ac-primary-hover); }
.ac-sidebar__new:active { transform: scale(0.98); }
.ac-sidebar__search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--ac-border);
  border-radius: 9px;
  padding: 0 10px;
  background: var(--ac-bg);
  color: var(--ac-text-tertiary);
  transition: border-color var(--ac-transition);
}
.ac-sidebar__search-box:focus-within { border-color: var(--ac-primary); }
.ac-sidebar__search {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ac-text);
  font-size: 13px;
  padding: 8px 0;
  font-family: inherit;
  min-width: 0;
}
.ac-sidebar__list { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ac-sidebar__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 9px 10px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13px;
  color: var(--ac-text-secondary);
  transition: background var(--ac-transition), color var(--ac-transition);
}
.ac-sidebar__item:hover { background: var(--ac-bg-hover); color: var(--ac-text); }
.ac-sidebar__item.is-active { background: var(--ac-primary-soft); color: var(--ac-primary); font-weight: 500; }
.ac-sidebar__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.ac-sidebar__ops { display: none; gap: 2px; flex-shrink: 0; }
.ac-sidebar__item:hover .ac-sidebar__ops { display: inline-flex; }
.ac-sidebar__op {
  border: none; background: none; cursor: pointer;
  color: var(--ac-text-tertiary); padding: 2px 3px;
  display: inline-flex; align-items: center;
  border-radius: 5px;
  transition: color var(--ac-transition);
}
.ac-sidebar__op:hover { color: var(--ac-primary); }
.ac-sidebar__op--danger:hover { color: var(--ac-danger); }
.ac-sidebar__empty { color: var(--ac-text-tertiary); font-size: 12px; text-align: center; padding: 24px 0; }
.ac-sidebar__rename { font-size: 13px; padding: 4px 8px; }
@media (max-width: 640px) {
  .ac-sidebar { display: none; }
}
</style>
