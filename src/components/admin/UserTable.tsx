"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { AdminUsersPage } from "@/lib/admin/types";

const planStyles: Record<string, string> = {
  free: "bg-surface-2 text-foreground",
  pro: "bg-brand/20 text-foreground",
  trialing: "bg-amber-500/10 text-amber-100",
  past_due: "bg-red-500/10 text-red-100",
  canceled: "bg-slate-500/20 text-slate-100",
};

const PAGE_SIZES = [10, 20, 30];

type UserTableProps = {
  pageData: AdminUsersPage;
};

export function UserTable({ pageData }: UserTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const page = pageData.page;
  const pageSize = pageData.pageSize;
  const totalPages = Math.max(1, Math.ceil(pageData.total / pageSize));

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/admin?${params.toString()}`);
  };

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/admin?${params.toString()}`);
  };

  const handlePageSizeChange = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(value));
    params.set("page", "1");
    router.push(`/admin?${params.toString()}`);
  };

  const formattedRows = useMemo(
    () =>
      pageData.users.map((user) => ({
        ...user,
        planLabel: user.plan ?? "free",
      })),
    [pageData.users]
  );

  const handleAction = async (
    userId: string,
    action: "upgrade" | "reset" | "deactivate"
  ) => {
    const label = action === "upgrade" ? "Upgrade user to Pro" : action === "reset" ? "Reset usage" : "Deactivate account";
    const confirmed = window.confirm(`${label}?`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/users/${userId}/${action}`, {
      method: "POST",
    });

    if (!response.ok) {
      return;
    }

    router.refresh();
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Users
          </p>
          <p className="mt-2 text-sm text-muted">
            Manage plans, usage, and account status.
          </p>
        </div>
        <form className="flex gap-2" onSubmit={handleSearch}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search email"
            className="w-56"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted">
          <thead>
            <tr className="border-b border-border/60 text-xs uppercase tracking-[0.3em] text-muted">
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Plan</th>
              <th className="py-3 pr-4">Monthly usage</th>
              <th className="py-3 pr-4">Signup</th>
              <th className="py-3 pr-4">Last activity</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {formattedRows.map((user) => (
              <tr key={user.id} className="border-b border-border/30">
                <td className="py-3 pr-4 text-foreground">
                  {user.email ?? "No email"}
                </td>
                <td className="py-3 pr-4">
                  <Badge className={planStyles[user.planLabel] ?? planStyles.free}>
                    {user.planLabel}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  {user.monthlyGenerations}
                </td>
                <td className="py-3 pr-4">
                  {user.signupAt.slice(0, 10)}
                </td>
                <td className="py-3 pr-4">
                  {user.lastGenerationAt?.slice(0, 10) ?? user.lastSignInAt?.slice(0, 10) ?? "-"}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAction(user.id, "upgrade")}
                    >
                      Upgrade
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAction(user.id, "reset")}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAction(user.id, "deactivate")}
                    >
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <div className="flex items-center gap-2">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(event) => handlePageSizeChange(Number(event.target.value))}
            className="rounded-xl border border-border/60 bg-surface px-2 py-1"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changePage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changePage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
