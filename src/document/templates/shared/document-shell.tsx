import type { ReactNode } from "react";

type DocumentShellProps = {
  children: ReactNode;
  title: string;
};

/** Outer HTML document shell for Playwright / preview. */
export function DocumentShell({ children, title }: DocumentShellProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <div className="doc-root">{children}</div>
      </body>
    </html>
  );
}
