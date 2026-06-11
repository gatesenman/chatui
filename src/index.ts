import type { App, Plugin } from 'vue'
import './styles/index.css'
import 'highlight.js/styles/atom-one-dark.css'

import AgentChatbot from './components/AgentChatbot.vue'
import SessionSidebar from './components/SessionSidebar.vue'
import WelcomeBlock from './components/WelcomeBlock.vue'
import MessageItem from './components/MessageItem.vue'
import MessageInput from './components/MessageInput.vue'
import MessageStatusBadge from './components/MessageStatusBadge.vue'
import FeedbackBar from './components/FeedbackBar.vue'
import MarkdownRenderer from './components/renderers/MarkdownRenderer.vue'
import CodeBlockRenderer from './components/renderers/CodeBlockRenderer.vue'
import TableRenderer from './components/renderers/TableRenderer.vue'
import ChartRenderer from './components/renderers/ChartRenderer.vue'
import FileCard from './components/renderers/FileCard.vue'
import DynamicForm from './components/forms/DynamicForm.vue'
import FormFields from './components/forms/FormFields.vue'
import ApprovalCard from './components/hitl/ApprovalCard.vue'
import ExecutionSteps from './components/run/ExecutionSteps.vue'

export * from './types'
export { applyStreamEvent, connectSSE } from './composables/useStreamEvents'
export type { SSEClientOptions } from './composables/useStreamEvents'

export {
  AgentChatbot,
  SessionSidebar,
  WelcomeBlock,
  MessageItem,
  MessageInput,
  MessageStatusBadge,
  FeedbackBar,
  MarkdownRenderer,
  CodeBlockRenderer,
  TableRenderer,
  ChartRenderer,
  FileCard,
  DynamicForm,
  FormFields,
  ApprovalCard,
  ExecutionSteps
}

const components = {
  AgentChatbot,
  SessionSidebar,
  WelcomeBlock,
  MessageItem,
  MessageInput,
  MessageStatusBadge,
  FeedbackBar,
  MarkdownRenderer,
  CodeBlockRenderer,
  TableRenderer,
  ChartRenderer,
  FileCard,
  DynamicForm,
  FormFields,
  ApprovalCard,
  ExecutionSteps
}

export const AgentChatUI: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  }
}

export default AgentChatUI
