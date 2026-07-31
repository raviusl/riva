import type { NotificationTemplate } from "@/core/notification";
import {
  notificationChannelLabel,
  notificationPriorityLabel,
  notificationTypeLabel,
} from "@/features/notification/lib/notification-labels";
import { uiZh } from "@/config/ui-zh";

type NotificationWorkspaceTemplatesPanelProps = {
  templates: readonly NotificationTemplate[];
};

export function NotificationWorkspaceTemplatesPanel({
  templates,
}: NotificationWorkspaceTemplatesPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.templates}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.templatesPanelDesc}
        </p>
      </div>

      {templates.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noTemplatesDefined}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {templates.map((template) => (
            <li
              key={template.key}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white">{template.label}</p>
                <span className="text-xs text-white/45">
                  {notificationTypeLabel(template.type)}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/55">
                {template.titleTemplate}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {template.messageTemplate}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/35">
                <span>
                  {uiZh.channelLabel(notificationChannelLabel(template.defaultChannel))}
                </span>
                <span>
                  {uiZh.priorityWithValue(
                    notificationPriorityLabel(template.defaultPriority),
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
