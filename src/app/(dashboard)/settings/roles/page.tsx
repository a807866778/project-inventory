import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function RolesPage() {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("role:manage")) {
    return (
      <div className="text-center py-12 text-gray-400">
        您没有权限访问此页面
      </div>
    );
  }

  const roles = await db.select().from(schema.roles).orderBy(desc(schema.roles.createdAt));

  const allPermissions = [
    { key: "material:view", label: "查看物料" },
    { key: "material:create", label: "创建物料" },
    { key: "material:update", label: "编辑物料" },
    { key: "material:delete", label: "删除物料" },
    { key: "inbound:view", label: "查看入库" },
    { key: "inbound:create", label: "创建入库" },
    { key: "outbound:view", label: "查看出库" },
    { key: "outbound:create", label: "创建出库" },
    { key: "project:view", label: "查看项目" },
    { key: "project:create", label: "创建项目" },
    { key: "supplier:view", label: "查看供应商" },
    { key: "supplier:create", label: "创建供应商" },
    { key: "report:view", label: "查看报表" },
    { key: "settings:view", label: "系统设置" },
    { key: "user:manage", label: "用户管理" },
    { key: "role:manage", label: "角色管理" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">职位权限管理</h1>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => {
          const permissions = JSON.parse(role.permissions) as string[];
          return (
            <div key={role.id} className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900">{role.name}</h2>
                {role.isDefault && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    默认角色
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {allPermissions.map((perm) => (
                  <span
                    key={perm.key}
                    className={`px-3 py-1 text-sm rounded-full ${
                      permissions.includes(perm.key)
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {permissions.includes(perm.key) ? "✓" : "✗"} {perm.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 权限说明 */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">权限说明</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">物料管理</h3>
            <ul className="space-y-1 text-gray-500">
              <li>• material:view - 查看物料列表和详情</li>
              <li>• material:create - 添加新物料</li>
              <li>• material:update - 编辑物料信息</li>
              <li>• material:delete - 删除物料</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">出入库</h3>
            <ul className="space-y-1 text-gray-500">
              <li>• inbound:view/create - 查看/创建入库单</li>
              <li>• outbound:view/create - 查看/创建出库单</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">项目</h3>
            <ul className="space-y-1 text-gray-500">
              <li>• project:view/create - 查看/创建项目</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">系统</h3>
            <ul className="space-y-1 text-gray-500">
              <li>• report:view - 查看收益报表</li>
              <li>• user:manage - 管理员工账号</li>
              <li>• role:manage - 管理职位权限</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
