import { uiZh } from "@/config/ui-zh";
import { getGreeting } from "@/config/i18n";

type CommandCenterGreetingProps = {
  displayName: string;
  workspaceName: string;
  companyName: string;
  roleKey: string;
};

export function CommandCenterGreeting({
  displayName,
  workspaceName,
  companyName,
  roleKey,
}: CommandCenterGreetingProps) {
  const greeting = getGreeting();

  return (
    <header className="space-y-2">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">
        {uiZh.commandCenter}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {greeting.zh}，{displayName}
      </h1>
      <p className="text-sm text-white/45">
        <span className="text-white/70">{workspaceName}</span>
        <span className="mx-2 text-white/20">·</span>
        <span className="text-white/70">{companyName}</span>
        <span className="mx-2 text-white/20">·</span>
        <span className="text-white/55">{roleKey}</span>
      </p>
    </header>
  );
}
