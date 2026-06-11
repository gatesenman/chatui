import type { ContentBlock, RuntimeStep, StreamEvent } from '@agent/chat-ui'

/**
 * 模拟 Agent 后端：根据用户输入生成一段 SSE 风格的事件流。
 * 真实接入时，用 connectSSE 连接后端 POST /api/chat/stream 即可。
 */
export async function runMockAgent(
  prompt: string,
  messageId: string,
  onEvent: (e: StreamEvent) => void,
  signal: AbortSignal
): Promise<void> {
  const sleep = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, ms)
      signal.addEventListener('abort', () => {
        clearTimeout(t)
        reject(new DOMException('aborted', 'AbortError'))
      }, { once: true })
    })

  const emit = (e: StreamEvent) => {
    if (!signal.aborted) onEvent(e)
  }

  const streamText = async (text: string, chunkSize = 4, delay = 30) => {
    for (let i = 0; i < text.length; i += chunkSize) {
      await sleep(delay)
      emit({ type: 'delta', messageId, text: text.slice(i, i + chunkSize) })
    }
  }

  const runSteps = async (names: string[]) => {
    const steps: RuntimeStep[] = names.map((name, i) => ({
      id: `step-${i}`,
      name,
      status: 'pending'
    }))
    for (const s of steps) emit({ type: 'step', messageId, step: { ...s } })
    for (const s of steps) {
      emit({ type: 'step', messageId, step: { ...s, status: 'running', startedAt: Date.now() } })
      await sleep(450)
      emit({ type: 'step', messageId, step: { ...s, status: 'completed', startedAt: Date.now() - 450, finishedAt: Date.now() } })
    }
  }

  try {
    emit({ type: 'status', messageId, status: 'thinking' })
    await sleep(600)

    if (prompt.includes('失败') || prompt.includes('报错')) {
      emit({ type: 'status', messageId, status: 'running' })
      await sleep(800)
      emit({ type: 'error', messageId, message: '工具调用超时：order-service 未响应（可点击重试）' })
      return
    }

    if (prompt.includes('销售') || prompt.includes('图表') || prompt.includes('报表')) {
      await runSteps(['识别意图', '检索销售数据', '聚合统计', '生成图表'])
      await streamText('已为你统计 **2025 年 Q1-Q4 销售数据**，结果如下：\n\n')
      const table: ContentBlock = {
        type: 'table',
        title: '季度销售明细',
        columns: [
          { key: 'quarter', title: '季度' },
          { key: 'revenue', title: '营收（万元）', sortable: true, align: 'right' },
          { key: 'orders', title: '订单数', sortable: true, align: 'right' },
          { key: 'growth', title: '同比增长' }
        ],
        rows: [
          { quarter: 'Q1', revenue: 1280, orders: 3421, growth: '+12%' },
          { quarter: 'Q2', revenue: 1545, orders: 3980, growth: '+18%' },
          { quarter: 'Q3', revenue: 1390, orders: 3622, growth: '+9%' },
          { quarter: 'Q4', revenue: 1820, orders: 4510, growth: '+24%' }
        ]
      }
      emit({ type: 'block', messageId, block: table })
      await sleep(400)
      emit({
        type: 'block',
        messageId,
        block: {
          type: 'chart',
          chartType: 'bar',
          title: '季度营收（万元）',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          series: [{ name: '营收', data: [1280, 1545, 1390, 1820] }]
        }
      })
      await sleep(300)
      emit({
        type: 'block',
        messageId,
        block: {
          type: 'file',
          fileId: 'f-2025-sales',
          name: '2025年度销售报告.xlsx',
          size: 245760,
          description: '完整明细数据'
        }
      })
      emit({ type: 'done', messageId })
      return
    }

    if (prompt.includes('请假') || prompt.includes('填报') || prompt.includes('表单')) {
      await runSteps(['识别意图', '加载请假流程表单'])
      await streamText('好的，请填写以下请假申请表单：\n')
      emit({
        type: 'block',
        messageId,
        block: {
          type: 'form',
          formId: 'leave-form-1',
          title: '请假申请',
          description: '请分步填写申请信息，提交后将进入审批流程。',
          steps: [
            {
              title: '基本信息',
              fields: [
                { key: 'name', label: '姓名', widget: 'input', required: true, placeholder: '请输入姓名' },
                {
                  key: 'dept',
                  label: '部门',
                  widget: 'select',
                  required: true,
                  options: [
                    { label: '研发部', value: 'rd' },
                    { label: '产品部', value: 'pm' },
                    { label: '市场部', value: 'mkt' }
                  ]
                }
              ]
            },
            {
              title: '请假信息',
              fields: [
                {
                  key: 'leaveType',
                  label: '请假类型',
                  widget: 'radio',
                  required: true,
                  options: [
                    { label: '年假', value: 'annual' },
                    { label: '事假', value: 'personal' },
                    { label: '病假', value: 'sick' }
                  ]
                },
                { key: 'startDate', label: '开始日期', widget: 'date', required: true },
                { key: 'days', label: '请假天数', widget: 'number', required: true, min: 0.5, max: 15 }
              ]
            },
            {
              title: '确认提交',
              fields: [
                { key: 'reason', label: '请假事由', widget: 'textarea', required: true, placeholder: '请简要说明' },
                { key: 'notify', label: '抄送主管', widget: 'switch', defaultValue: true }
              ]
            }
          ]
        }
      })
      emit({ type: 'done', messageId })
      return
    }

    if (prompt.includes('审批') || prompt.includes('退款') || prompt.includes('确认')) {
      await runSteps(['识别意图', '查询订单信息', '生成退款方案'])
      await streamText('已生成退款方案，金额超过自动审批阈值，需要你确认后才能执行：\n')
      emit({ type: 'status', messageId, status: 'waiting_hitl' })
      emit({
        type: 'block',
        messageId,
        block: {
          type: 'hitl',
          taskId: 'hitl-refund-1',
          title: '退款操作确认',
          description: '以下退款将调用支付系统执行，请确认。',
          fields: [
            { key: 'orderId', label: '订单号', value: 'ORD-20260611-0042', editable: false },
            { key: 'customer', label: '客户', value: '上海某某科技有限公司', editable: false },
            { key: 'amount', label: '退款金额', value: '¥12,800.00' },
            { key: 'reason', label: '退款原因', value: '商品质量问题' }
          ],
          actions: ['approve', 'modify', 'reject', 'supplement']
        }
      })
      return
    }

    if (prompt.includes('代码') || prompt.includes('sql') || prompt.includes('SQL')) {
      await runSteps(['识别意图', '生成 SQL'])
      await streamText('以下是查询各部门月度报销总额的 SQL：\n')
      emit({
        type: 'block',
        messageId,
        block: {
          type: 'code',
          language: 'sql',
          code: "SELECT d.name AS dept,\n       DATE_FORMAT(e.created_at, '%Y-%m') AS month,\n       SUM(e.amount) AS total\nFROM expense e\nJOIN department d ON d.id = e.dept_id\nWHERE e.status = 'approved'\nGROUP BY d.name, month\nORDER BY month DESC, total DESC;"
        }
      })
      await streamText('\n说明：\n- 仅统计 `status = approved` 的单据\n- 按月份倒序排列\n\n> 如需导出 Excel，可以直接告诉我。')
      emit({ type: 'done', messageId })
      return
    }

    // 默认 Markdown 流式回复
    emit({ type: 'status', messageId, status: 'running' })
    await sleep(400)
    await streamText(
      `收到你的问题：「${prompt}」。\n\n我是企业智能助手，可以演示以下能力：\n\n1. **流式输出** — 当前回复就是逐字流式渲染的\n2. **数据报表** — 试试发送「查询销售报表」\n3. **分步表单** — 试试发送「我要请假」\n4. **人工审批 (HITL)** — 试试发送「帮客户办理退款」\n5. **代码生成** — 试试发送「写一段 SQL」\n6. **失败重试** — 试试发送「模拟失败」\n\n也可以点击上方快捷指令快速体验。`
    )
    emit({ type: 'done', messageId })
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      emit({ type: 'error', messageId, message: (err as Error).message })
    }
  }
}
