export interface Locale {
  send: string
  stop: string
  retry: string
  newSession: string
  searchSessions: string
  noSessions: string
  thinking: string
  running: string
  streaming: string
  pending: string
  waitingConfirm: string
  completed: string
  failed: string
  canceled: string
  executionFailed: string
  copy: string
  copied: string
  like: string
  dislike: string
  submitCorrection: string
  correctionSent: string
  correctionPlaceholder: string
  cancel: string
  submit: string
  prevStep: string
  nextStep: string
  submitted: string
  needConfirm: string
  approve: string
  reject: string
  modify: string
  supplement: string
  confirmModify: string
  confirmReject: string
  submitSupplement: string
  rejectReasonPlaceholder: string
  supplementPlaceholder: string
  resolved: string
  executionProcess: string
  viewTrace: string
  download: string
  upload: string
  voice: string
  recording: string
  inputPlaceholder: string
  textInputDisabled: string
  attachment: string
  remove: string
  rename: string
  deleteSession: string
  copyMessage: string
  messageCopied: string
  scrollToBottom: string
  justNow: string
  selectPlaceholder: string
  enabled: string
  required: string
  formatError: string
  minError: string
  maxError: string
}

export const zhCN: Locale = {
  send: '发送',
  stop: '停止',
  retry: '重试',
  newSession: '新建会话',
  searchSessions: '搜索会话',
  noSessions: '暂无会话',
  thinking: '思考中',
  running: '执行中',
  streaming: '回复中',
  pending: '排队中',
  waitingConfirm: '等待确认',
  completed: '完成',
  failed: '失败',
  canceled: '已停止',
  executionFailed: '执行失败',
  copy: '复制',
  copied: '已复制',
  like: '有帮助',
  dislike: '待改进',
  submitCorrection: '提交修正',
  correctionSent: '修正已提交',
  correctionPlaceholder: '请输入正确答案或修改建议',
  cancel: '取消',
  submit: '提交',
  prevStep: '上一步',
  nextStep: '下一步',
  submitted: '已提交',
  needConfirm: '需要确认',
  approve: '同意',
  reject: '拒绝',
  modify: '修改',
  supplement: '补充信息',
  confirmModify: '确认修改并提交',
  confirmReject: '确认拒绝',
  submitSupplement: '提交补充',
  rejectReasonPlaceholder: '请输入拒绝原因（可选）',
  supplementPlaceholder: '请补充信息',
  resolved: '已处理',
  executionProcess: '执行过程',
  viewTrace: '查看 Trace 详情',
  download: '下载',
  upload: '上传',
  voice: '语音',
  recording: '录音中',
  inputPlaceholder: '请输入消息，Enter 发送，Shift+Enter 换行',
  textInputDisabled: '文本输入已关闭',
  attachment: '附件',
  remove: '移除',
  rename: '重命名',
  deleteSession: '删除',
  copyMessage: '复制',
  messageCopied: '已复制到剪贴板',
  scrollToBottom: '回到最新',
  justNow: '刚刚',
  selectPlaceholder: '请选择',
  enabled: '开启',
  required: '为必填项',
  formatError: '格式不正确',
  minError: '不能小于',
  maxError: '不能大于'
}

export const enUS: Locale = {
  send: 'Send',
  stop: 'Stop',
  retry: 'Retry',
  newSession: 'New Chat',
  searchSessions: 'Search',
  noSessions: 'No conversations',
  thinking: 'Thinking',
  running: 'Running',
  streaming: 'Replying',
  pending: 'Queued',
  waitingConfirm: 'Awaiting',
  completed: 'Done',
  failed: 'Failed',
  canceled: 'Stopped',
  executionFailed: 'Execution failed',
  copy: 'Copy',
  copied: 'Copied',
  like: 'Helpful',
  dislike: 'Not helpful',
  submitCorrection: 'Correct',
  correctionSent: 'Correction sent',
  correctionPlaceholder: 'Provide the correct answer or suggestion',
  cancel: 'Cancel',
  submit: 'Submit',
  prevStep: 'Previous',
  nextStep: 'Next',
  submitted: 'Submitted',
  needConfirm: 'Needs Confirmation',
  approve: 'Approve',
  reject: 'Reject',
  modify: 'Modify',
  supplement: 'Add Info',
  confirmModify: 'Confirm & Submit',
  confirmReject: 'Confirm Reject',
  submitSupplement: 'Submit Info',
  rejectReasonPlaceholder: 'Reason for rejection (optional)',
  supplementPlaceholder: 'Provide additional information',
  resolved: 'Resolved',
  executionProcess: 'Execution Steps',
  viewTrace: 'View Trace',
  download: 'Download',
  upload: 'Upload',
  voice: 'Voice',
  recording: 'Recording',
  inputPlaceholder: 'Type a message, Enter to send, Shift+Enter for new line',
  textInputDisabled: 'Text input is disabled',
  attachment: 'Attachment',
  remove: 'Remove',
  rename: 'Rename',
  deleteSession: 'Delete',
  copyMessage: 'Copy',
  messageCopied: 'Copied to clipboard',
  scrollToBottom: 'Scroll to bottom',
  justNow: 'just now',
  selectPlaceholder: 'Please select',
  enabled: 'Enabled',
  required: 'is required',
  formatError: 'format is invalid',
  minError: 'cannot be less than',
  maxError: 'cannot be greater than'
}

const locales: Record<string, Locale> = { 'zh-CN': zhCN, 'en-US': enUS }

export function getLocale(lang?: string): Locale {
  if (!lang) return zhCN
  return locales[lang] ?? zhCN
}
