<script setup lang="ts">
import { computed } from 'vue'
import type { ChartBlock } from '../../types'

const props = defineProps<{ block: ChartBlock }>()

const W = 480
const H = 240
const PAD = { top: 16, right: 16, bottom: 28, left: 40 }
const DEFAULT_COLORS = ['#4f6ef7', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#0891b2']

function color(i: number) {
  return props.block.series[i]?.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]
}

const maxValue = computed(() => {
  const all = props.block.series.flatMap((s) => s.data)
  return Math.max(...all, 0) || 1
})

const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

function yPos(v: number) {
  return PAD.top + plotH - (v / maxValue.value) * plotH
}

const yTicks = computed(() => {
  const ticks = []
  for (let i = 0; i <= 4; i++) {
    const v = (maxValue.value / 4) * i
    ticks.push({ v: Math.round(v * 100) / 100, y: yPos(v) })
  }
  return ticks
})

const xPositions = computed(() => {
  const n = props.block.labels.length || 1
  return props.block.labels.map((_, i) => PAD.left + (plotW / n) * (i + 0.5))
})

const bars = computed(() => {
  const n = props.block.labels.length || 1
  const groupW = plotW / n
  const sCount = props.block.series.length || 1
  const barW = Math.min(28, (groupW * 0.7) / sCount)
  return props.block.series.map((s, si) =>
    s.data.map((v, i) => ({
      x: PAD.left + groupW * i + groupW / 2 - (barW * sCount) / 2 + barW * si,
      y: yPos(v),
      w: barW,
      h: PAD.top + plotH - yPos(v),
      v
    }))
  )
})

const lines = computed(() =>
  props.block.series.map((s) =>
    s.data.map((v, i) => `${xPositions.value[i]},${yPos(v)}`).join(' ')
  )
)

const pieSlices = computed(() => {
  const data = props.block.series[0]?.data ?? []
  const total = data.reduce((a, b) => a + b, 0) || 1
  let angle = -Math.PI / 2
  const cx = W / 2
  const cy = H / 2
  const r = Math.min(plotW, plotH) / 2
  return data.map((v, i) => {
    const start = angle
    const sweep = (v / total) * Math.PI * 2
    angle += sweep
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      label: props.block.labels[i],
      pct: Math.round((v / total) * 100),
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length]
    }
  })
})
</script>

<template>
  <div class="ac-chart">
    <div v-if="block.title" class="ac-chart__title">{{ block.title }}</div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="ac-chart__svg" role="img" :aria-label="block.title || '图表'">
      <template v-if="block.chartType !== 'pie'">
        <g v-for="t in yTicks" :key="t.y">
          <line :x1="PAD.left" :x2="W - PAD.right" :y1="t.y" :y2="t.y" class="ac-chart__grid" />
          <text :x="PAD.left - 6" :y="t.y + 4" class="ac-chart__tick" text-anchor="end">{{ t.v }}</text>
        </g>
        <text
          v-for="(label, i) in block.labels"
          :key="label"
          :x="xPositions[i]"
          :y="H - 8"
          class="ac-chart__tick"
          text-anchor="middle"
        >
          {{ label }}
        </text>
      </template>

      <template v-if="block.chartType === 'bar'">
        <g v-for="(serie, si) in bars" :key="si">
          <rect
            v-for="(b, i) in serie"
            :key="i"
            :x="b.x"
            :y="b.y"
            :width="b.w"
            :height="b.h"
            :fill="color(si)"
            rx="3"
          />
        </g>
      </template>

      <template v-else-if="block.chartType === 'line'">
        <g v-for="(points, si) in lines" :key="si">
          <polyline :points="points" fill="none" :stroke="color(si)" stroke-width="2" />
          <circle
            v-for="(v, i) in block.series[si].data"
            :key="i"
            :cx="xPositions[i]"
            :cy="yPos(v)"
            r="3"
            :fill="color(si)"
          />
        </g>
      </template>

      <template v-else>
        <path v-for="(s, i) in pieSlices" :key="i" :d="s.d" :fill="s.color" stroke="#fff" stroke-width="1" />
      </template>
    </svg>
    <div class="ac-chart__legend">
      <template v-if="block.chartType === 'pie'">
        <span v-for="s in pieSlices" :key="s.label" class="ac-chart__legend-item">
          <i :style="{ background: s.color }" />{{ s.label }} {{ s.pct }}%
        </span>
      </template>
      <template v-else>
        <span v-for="(s, i) in block.series" :key="s.name" class="ac-chart__legend-item">
          <i :style="{ background: color(i) }" />{{ s.name }}
        </span>
      </template>
    </div>
  </div>
</template>

<style>
.ac-chart { border: 1px solid var(--ac-border); border-radius: 8px; padding: 12px; margin: 4px 0; max-width: 520px; }
.ac-chart__title { font-weight: 600; margin-bottom: 6px; }
.ac-chart__svg { width: 100%; height: auto; display: block; }
.ac-chart__grid { stroke: var(--ac-border); stroke-width: 1; }
.ac-chart__tick { font-size: 10px; fill: var(--ac-text-secondary); }
.ac-chart__legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; font-size: 12px; color: var(--ac-text-secondary); }
.ac-chart__legend-item { display: inline-flex; align-items: center; gap: 4px; }
.ac-chart__legend-item i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
</style>
