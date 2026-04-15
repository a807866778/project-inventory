export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { UserForm } from "./form";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("user:manage")) {
    return (
      <div className="text-center py-12 text-gray-400">
        您没有权限访问此页面
      </div>
    );
  }

  const users = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));

  const usersWithRoles = await Promise.all(
    users.map(async (u) => {
      const userRoles = await db
        .select({ roleId: schema.userRoles.roleId })
        .from(schema.userRoles)
        .where(eq(schema.userRoles.userId, u.id));

      const roles = await Promise.all(
        userRoles.map(async (ur) => {
          const role = await db
            .select()
            .from(schema.roles)
            .where(eq(schema.roles.id, ur.roleId))
            .get();
          return role?.name || "";
        })
      );

      return {
        ...u,
        roles: roles.filter(Boolean).join(", "),
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">员工管理</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>姓名</th>
                <th>角色</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {usersWithRoles.map((u) => (
                <tr key={u.id}>
                  <td className="font-mono">{u.username}</td>
                  <td>{u.realName}</td>
                  <td>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {u.roles || "未分配"}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">添加员工</h2>
        <UserForm />
      </div>
    </div>
  );
}
