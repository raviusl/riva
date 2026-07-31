import type { AutomationAction } from "@/core/automation";
import { uiZh } from "@/config/ui-zh";
import type { AutomationWorkspaceModel } from "@/features/automation/lib/automation-types";
import { automationActionLabel } from "@/features/automation/lib/automation-labels";

type AutomationWorkspaceActionsPanelProps = {
  automation: AutomationWorkspaceModel;
};

function actionDetail(action: AutomationAction): string {
  const config = action.config ?? {};
  switch (action.type) {
    case "delay":
      return config.minutes
        ? uiZh.waitMinutes(String(config.minutes))
        : uiZh.delayStep;
    case "send_notification":
      return (
        [
          config.template
            ? uiZh.templateLabel(String(config.template))
            : null,
          config.channel ? uiZh.channelLabel(String(config.channel)) : null,
        ]
          .filter(Boolean)
          .join(" · ") || uiZh.sendNotification
      );
    case "create_task":
      return config.title
        ? uiZh.createTaskNamed(String(config.title))
        : uiZh.createTask;
    case "create_meeting":
      return config.title
        ? uiZh.createMeetingNamed(String(config.title))
        : uiZh.createMeeting;
    case "create_document":
      return config.name
        ? uiZh.createDocumentNamed(String(config.name))
        : uiZh.createDocumentAction;
    case "webhook":
      return config.url
        ? uiZh.webhookWithUrl(String(config.url))
        : uiZh.webhookPlaceholder;
    case "update_task":
      return uiZh.updateTaskAction;
    case "update_project":
      return uiZh.updateProjectAction;
    case "assign_user":
      return uiZh.assignUserAction;
    default:
      return automationActionLabel(action.type);
  }
}

export function AutomationWorkspaceActionsPanel({
  automation,
}: AutomationWorkspaceActionsPanelProps) {
  const actions = [...automation.actions].sort((a, b) => a.order - b.order);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.actionSteps}</h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.actionsSequenceDesc}</p>
      </div>

      {actions.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noActionsConfigured}</p>
      ) : (
        <ol className="mt-5 space-y-3">
          {actions.map((action) => (
            <li
              key={action.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white">
                  <span className="mr-2 text-white/35">{action.order}.</span>
                  {automationActionLabel(action.type)}
                </p>
                {action.type === "webhook" ? (
                  <span className="text-[11px] text-white/35">
                    {uiZh.placeholderValue}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-white/45">{actionDetail(action)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
