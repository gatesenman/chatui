<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableBlock } from '../../types'

const props = defineProps<{ block: TableBlock }>()

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

function toggleSort(key: string, sortable?: boolean) {
  if (!sortable) return
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const rows = computed(() => {
  if (!sortKey.value) return props.block.rows
  const key = sortKey.value
  const dir = sortOrder.value === 'asc' ? 1 : -1
  return [...props.block.rows].sort((a, b) => {
    const va = a[key]
    const vb = b[key]
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
    return String(va ?? '').localeCompare(String(vb ?? ''), 'zh-CN') * dir
  })
})
</script>

<template>
  <div class="ac-table">
    <div v-if="block.title" class="ac-table__title">{{ block.title }}</div>
    <div class="ac-table__scroll">
      <table>
        <thead>
          <tr>
            <th
              v-for="col in block.columns"
              :key="col.key"
              :style="{ width: col.width, textAlign: col.align || 'left' }"
              :class="{ 'is-sortable': col.sortable }"
              @click="toggleSort(col.key, col.sortable)"
            >
              {{ col.title }}
              <span v-if="col.sortable" class="ac-table__sort">
                {{ sortKey === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td
              v-for="col in block.columns"
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
            >
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.ac-table { border: 1px solid var(--ac-border); border-radius: 8px; overflow: hidden; margin: 4px 0; }
.ac-table__title { padding: 8px 12px; font-weight: 600; border-bottom: 1px solid var(--ac-border); background: var(--ac-bg-soft); }
.ac-table__scroll { overflow-x: auto; }
.ac-table table { border-collapse: collapse; width: 100%; min-width: max-content; }
.ac-table th, .ac-table td { padding: 7px 12px; border-bottom: 1px solid var(--ac-border); font-size: 13px; white-space: nowrap; }
.ac-table th { background: var(--ac-bg-soft); font-weight: 600; user-select: none; }
.ac-table th.is-sortable { cursor: pointer; }
.ac-table tbody tr:last-child td { border-bottom: none; }
.ac-table__sort { font-size: 11px; color: var(--ac-text-secondary); margin-left: 2px; }
</style>
