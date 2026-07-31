"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uiZh } from "@/config/ui-zh";
import { INVITE_ROLE_LABELS, type InviteRole } from "@/features/auth/schemas/invite";
import type { ManagedUser } from "@/features/auth/invite/list-managed-users";

function roleLabel(role: string | null) {
  if (!role) return uiZh.emDash;
  return INVITE_ROLE_LABELS[role as InviteRole]?.zh ?? role;
}

export function UsersTable({ users }: { users: ManagedUser[] }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium tracking-wide text-white/80">
          {uiZh.usersSection}
        </h2>
        <p className="mt-1 text-xs text-white/40">{uiZh.usersSectionDesc}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {users.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-white/45">
            {uiZh.noUsersYet}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40">{uiZh.name}</TableHead>
                <TableHead className="text-white/40">{uiZh.email}</TableHead>
                <TableHead className="text-white/40">{uiZh.company}</TableHead>
                <TableHead className="text-white/40">{uiZh.role}</TableHead>
                <TableHead className="text-white/40">{uiZh.joined}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-white/[0.06] hover:bg-white/[0.03]"
                >
                  <TableCell className="font-medium text-white/90">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {user.email || uiZh.emDash}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {user.company || uiZh.emDash}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-white/15 text-white/80"
                    >
                      {roleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/55">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
