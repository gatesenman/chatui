# agent-chatbot-ui-vue

通用 Agent Chatbot UI 组件库（Vue 3 + TypeScript），覆盖企业级 Agent 聊天场景的前端能力：

- **基础聊天**：聊天窗口、消息列表、输入框、加载态、消息状态（思考中/执行中/等待确认/失败/完成）、失败重试、停止生成
- **SSE 流式输出**：内置 `connectSSE` 客户端 + `applyStreamEvent` 增量渲染协议
- **会话管理**：新建会话、历史会话列表、搜索、删除、标题展示与重命名
- **输入能力**：文本（Enter 发送）、文件/图片上传、语音入口，可按配置开关
- **消息渲染**：Markdown、代码块（高亮+复制）、表格（排序+横向滚动）、图表（柱/折线/饼，纯 SVG 零依赖）、文件卡片下载
- **结构化交互**：Schema 驱动的动态表单（校验）、多步骤表单（步骤条+分步校验）
- **HITL 人工确认**：审批卡片（同意/拒绝/修改/补充信息）、审批后继续执行、拒绝原因
- **运行可视化**：执行步骤进度（折叠详情）、Trace 详情入口
- **反馈评价**：点赞点踩、人工修正反馈
- **品牌配置**：标题、头像、主题色、气泡/文档布局、暗色模式、欢迎语、快捷指令

## 安装

```bash
npm install agent-chatbot-ui-vue
```

## 快速开始

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AgentChatbot, applyStreamEvent, connectSSE } from 'agent-chatbot-ui-vue'
import type { ChatMessage, ChatbotConfig, SendMessagePayload } from 'agent-chatbot-ui-vue'
import 'agent-chatbot-ui-vue/style.css'

const config: ChatbotConfig = {
  welcomeTitle: '你好，我是企业智能助手',
  welcomeMessage: '有什么可以帮你？',
  quickActions: [{ id: '1', label: '查询销售报表', prompt: '查询销售报表' }],
  input: { text: true, file: true, voice: true },
  theme: { title: '企业智能助手', primaryColor: '#4f6ef7' }
}

const messages = reactive<ChatMessage[]>([])
const busy = ref(false)
let abort: AbortController | null = null

async function onSend(payload: SendMessagePayload) {
  messages.push({
    id: crypto.randomUUID(),
    role: 'user',
    status: 'completed',
    blocks: [{ type: 'text', text: payload.text }],
    createdAt: Date.now()
  })
  const assistantId = crypto.randomUUID()
  messages.push({ id: assistantId, role: 'assistant', status: 'pending', blocks: [], createdAt: Date.now() })

  busy.value = true
  abort = new AbortController()
  await connectSSE({
    url: '/api/chat/stream',
    body: { messageId: assistantId, text: payload.text },
    signal: abort.signal,
    onEvent: (e) => applyStreamEvent(messages, e),
    onClose: () => (busy.value = false)
  })
}
</script>

<template>
  <AgentChatbot
    :config="config"
    :messages="messages"
    :busy="busy"
    @send="onSend"
    @stop="abort?.abort()"
  />
</template>
```

## SSE 流式事件协议

后端通过 SSE 推送 `data: {...}` 行，每条 data 为一个 `StreamEvent`：

| type | 含义 |
| --- | --- |
| `status` | 更新消息状态（thinking / running / waiting_hitl / ...） |
| `delta` | 追加流式文本（Markdown 增量） |
| `block` | 推送结构化内容块（表格/图表/表单/HITL 卡片/文件等） |
| `step` | 更新执行步骤（识别意图、检索、调用工具等） |
| `error` | 标记失败并附带错误信息 |
| `done` | 标记消息完成 |

## 消息内容块（ContentBlock）

一条消息由多个块组成：`text` / `markdown` / `code` / `table` / `chart` / `file` / `form`（单步或多步） / `hitl` / `steps` / `custom`（通过 `custom-block` slot 由宿主应用渲染）。

## 主要组件

| 组件 | 说明 |
| --- | --- |
| `AgentChatbot` | 聊天总容器（侧边栏 + 头部 + 消息列表 + 输入区） |
| `MessageItem` / `MessageInput` / `SessionSidebar` / `WelcomeBlock` | 可单独使用的子组件 |
| `MarkdownRenderer` / `CodeBlockRenderer` / `TableRenderer` / `ChartRenderer` / `FileCard` | 消息渲染器 |
| `DynamicForm` | Schema 驱动的动态/多步骤表单 |
| `ApprovalCard` | HITL 审批确认卡片 |
| `ExecutionSteps` | 执行步骤可视化 |

## 事件一览（AgentChatbot）

`send` `stop` `retry` `session-select` `session-create` `session-remove` `session-rename` `hitl-action` `form-submit` `feedback` `correction` `open-trace` `file-download` `voice-start` `voice-stop`

宿主应用监听这些事件并对接后端 API（如 `POST /api/chat/sessions/{id}/messages`、`POST /api/hitl/tasks/{id}/actions`、`POST /api/runtime/tasks/{id}/cancel` 等）。

## 本地开发

```bash
npm install
npm run dev        # 启动 demo 演示（含模拟 Agent）
npm run typecheck  # vue-tsc 类型检查
npm run build      # 构建组件库
npm run build:demo # 构建 demo 站点
```
