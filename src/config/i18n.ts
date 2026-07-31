export const navItems = [
  {
    href: "/dashboard",
    icon: "home",
    emoji: "🏠",
    label: {
      zh: "仪表板",
      en: "Dashboard",
    },
  },
  {
    href: "/dashboard/projects",
    icon: "folder",
    emoji: "📁",
    label: {
      zh: "项目",
      en: "Projects",
    },
  },
  {
    href: "/dashboard/clients",
    icon: "users",
    emoji: "👥",
    label: {
      zh: "客户",
      en: "Clients",
    },
  },
  {
    href: "/dashboard/vendors",
    icon: "handshake",
    emoji: "🤝",
    label: {
      zh: "供应商",
      en: "Vendors",
    },
  },
  {
    href: "/dashboard/settings",
    icon: "settings",
    emoji: "⚙️",
    label: {
      zh: "设置",
      en: "Settings",
    },
  },
] as const;

export type BilingualText = {
  zh: string;
  en: string;
};

export const copy = {
  appName: { zh: "RIVA OS", en: "RIVA OS" },
  todayOverview: { zh: "今日概览", en: "Today Overview" },
  todaysMeetings: { zh: "今天会议", en: "Today's Meetings" },
  todaysWeddings: { zh: "今天婚礼", en: "Today's Weddings" },
  followUpClients: { zh: "待跟进客户", en: "Follow-up Clients" },
  todaysTasks: { zh: "今日任务", en: "Today's Tasks" },
  monthlyRevenue: { zh: "本月营业额", en: "Monthly Revenue" },
  monthlyProfit: { zh: "本月利润", en: "Monthly Profit" },
  outstandingPayments: { zh: "待收款", en: "Outstanding Payments" },
  upcomingWeddings: { zh: "最近婚礼", en: "Upcoming Weddings" },
  weddingName: { zh: "婚礼名称", en: "Wedding Name" },
  date: { zh: "日期", en: "Date" },
  venue: { zh: "场地", en: "Venue" },
  status: { zh: "状态", en: "Status" },
  priority: { zh: "优先级", en: "Priority" },
  dueTime: { zh: "截止时间", en: "Due Time" },
  owner: { zh: "负责人", en: "Owner" },
  aiTitle: { zh: "RIVA AI 助理", en: "RIVA AI Assistant" },
  aiInputLabel: { zh: "告诉 RIVA…", en: "Tell RIVA…" },
  aiPlaceholder: {
    zh: "例如：提醒我明天跟进 Jason / 建立 Wedding Timeline / 回复客户 / 生成报价单",
    en: "e.g. Remind me to follow up Jason tomorrow / Build wedding timeline / Reply to client / Generate quotation",
  },
  quickActions: { zh: "快捷操作", en: "Quick Actions" },
  addClient: { zh: "新增客户", en: "New Client" },
  addWedding: { zh: "新增婚礼", en: "New Wedding" },
  addTask: { zh: "新增任务", en: "New Task" },
  addQuote: { zh: "新增报价", en: "New Quotation" },
  emptyTitle: { zh: "暂无数据", en: "No data yet" },
  emptyDescription: {
    zh: "数据库中尚无记录。添加后会显示在这里。",
    en: "Nothing in the database yet. Items will appear here once created.",
  },
  comingSoonTitle: { zh: "即将推出", en: "Coming soon" },
  comingSoonDescription: {
    zh: "此模块尚未开放。请先使用项目、客户与供应商。",
    en: "This module is not available yet. Use Projects, Clients, and Vendors for now.",
  },
  signIn: { zh: "登录", en: "Sign In" },
  email: { zh: "邮箱", en: "Email" },
  password: { zh: "密码", en: "Password" },
  signOut: { zh: "退出登录", en: "Sign Out" },
  greetingMorning: { zh: "早安", en: "Good morning" },
  greetingAfternoon: { zh: "午安", en: "Good afternoon" },
  greetingEvening: { zh: "晚安", en: "Good evening" },
  send: { zh: "发送", en: "Send" },
  cancel: { zh: "取消", en: "Cancel" },
  save: { zh: "保存", en: "Save" },
  commandCenter: { zh: "RIVA Workspace", en: "RIVA Workspace" },
} as const;

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return copy.greetingMorning;
  if (hour < 18) return copy.greetingAfternoon;
  return copy.greetingEvening;
}
