import { listUsers } from "@/server/queries/users";
import { requireAdmin } from "@/lib/permissions";
import { DataTable } from "@/app/backend/posts/data-table";
import { columns } from "./columns";
import { AddUserDialog } from "./add-user-dialog";

export default async function UsersPage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "account" : "accounts"} registered.
          </p>
        </div>
        <AddUserDialog />
      </div>
      <DataTable columns={columns} data={users} emptyMessage="No users yet." />
    </div>
  );
}
