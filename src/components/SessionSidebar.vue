<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatSession } from '../types'

const props = defineProps<{ sessions: ChatSession[]; activeId?: string | null }>()
const emit = defineEmits<{
  select: [sessionId: string]
  create: []
  remove: [sessionId: string]
  rename: [sessionId: string, title: string]
}>()

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
    <button class="ac-btn ac-btn--primary ac-sidebar__new" type="button" @click="emit('create')">
      ＋ 新建会话
    </button>
    <input v-model="keyword" class="ac-input ac-sidebar__search" placeholder="搜索会话" />
    <ul class="ac-sidebar__list">
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
            <button class="ac-sidebar__op" type="button" title="重命名" @click.stop="startRename(s)">[改名]</button>
            <button class="ac-sidebar__op" type="button" title="删除" @click.stop="emit('remove', s.id)">[删除]</button>
          </span>
        </template>
      </li>
      <li v-if="!filtered.length" class="ac-sidebar__empty">暂无会话</li>
    </ul>
  </aside>
</template>

<style>
.ac-sidebar {
  width: 230px;
  flex-shrink: 0;
  border-right: 1px solid var(--ac-border);
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 10px;
  background: var(--ac-bg-soft);
  min-height: 0;
}
.ac-sidebar__new { justify-content: center; }
.ac-sidebar__list { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ac-sidebar__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.ac-sidebar__item:hover { background: var(--ac-primary-soft); }
.ac-sidebar__item.is-active { background: var(--ac-primary-soft); color: var(--ac-primary); font-weight: 500; }
.ac-sidebar__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.ac-sidebar__ops { display: none; gap: 2px; flex-shrink: 0; }
.ac-sidebar__item:hover .ac-sidebar__ops { display: inline-flex; }
.ac-sidebar__op { border: none; background: none; cursor: pointer; color: var(--ac-text-secondary); font-size: 12px; padding: 1px 3px; }
.ac-sidebar__op:hover { color: var(--ac-primary); }
.ac-sidebar__empty { color: var(--ac-text-secondary); font-size: 12px; text-align: center; padding: 16px 0; }
.ac-sidebar__rename { font-size: 13px; padding: 4px 8px; }
</style>
