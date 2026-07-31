import { AppEmptyState } from "@/components/layout/app-empty-state";
import { Badge } from "@/components/ui/badge";
import { uiZh } from "@/config/ui-zh";
import type { TaskPriority, Tables } from "@/types/database";

const priorityLabel: Record<TaskPriority, string> = {
  low: uiZh.priorityLow,
  medium: uiZh.priorityMedium,
  high: uiZh.priorityHigh,
  urgent: uiZh.priorityUrgent,
};

type TaskRow = Tables<"tasks"> & {
  owner: Pick<Tables<"profiles">, "id" | "display_name" | "full_name"> | null;
};

type TaskCardProps = {
  tasks: TaskRow[];
};

function formatDue(dueAt: string | null) {
  if (!dueAt) return uiZh.emDash;
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dueAt));
}

export function TaskCard({ tasks }: TaskCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="text-sm text-white/85">{uiZh.todaysTasks}</h2>

      {tasks.length === 0 ? (
        <div className="mt-4">
          <AppEmptyState />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.05]">
          <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr] gap-2 border-b border-white/[0.05] bg-white/[0.03] px-3 py-2 text-[11px] text-white/40">
            <span>{uiZh.taskSingular}</span>
            <span>{uiZh.priority}</span>
            <span>{uiZh.dueTime}</span>
            <span>{uiZh.owner}</span>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {tasks.map((task) => {
              const priority = priorityLabel[task.priority];
              const ownerName =
                task.owner?.display_name ||
                task.owner?.full_name ||
                uiZh.emDash;
              return (
                <li
                  key={task.id}
                  className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr] items-center gap-2 px-3 py-3 text-sm"
                >
                  <span className="truncate font-medium text-white/90">
                    {task.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit border-white/10 bg-white/[0.06] text-[11px] text-white/75"
                  >
                    {priority}
                  </Badge>
                  <span className="tabular-nums text-white/60">
                    {formatDue(task.due_at)}
                  </span>
                  <span className="truncate text-white/55">{ownerName}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
