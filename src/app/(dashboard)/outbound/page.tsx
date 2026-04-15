import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { format } from "date-fns";

export default async function OutboundPage() {
  const user = await getCurrentUser();
  const canCreate = user?.permissions.includes("outbound:create");

  // 获取所有出库记录
  const records = await db
    .select()
    .from(schema.outboundRecords)
    .orderBy(desc(schema.outboundRecords.createdAt))
    .limit(50);

  // 获取关联信息
  const recordsWithDetails = await Promise.all(
    records.map(async (record) => {
      const project = await db.query.projects.findFirst({
        where: eq(schema.projects.id, record.projectId),
      });

      const operator = await db.query.users.findFirst({
        where: eq(schema.users.id, record.operatorId),
      });

      const items = await db
        .select()
        .from(schema.outboundItems)
        .where(eq(schema.outboundItems.outboundId, record.id));

      return {
        ...record,
        projectName: project?.name || "未知项目",
        operatorName: operator?.realName || "未知",
        itemCount: items.length,
      };
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">出库管理</h1>
        {canCreate && (
          <Link href="/outbound/new" className="btn-primary">
            + 新建出库单
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>出库单号</th>
                <th>项目</th>
                <th>操作员</th>
                <th className="text-right">总金额</th>
                <th>物料数</th>
                <th>出库时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {recordsWithDetails.map((record) => (
                <tr key={record.id}>
                  <td className="font-mono text-sm">{record.id.slice(0, 8)}</td>
                  <td className="font-medium">{record.projectName}</td>
                  <td>{record.operatorName}</td>
                  <td className="text-right font-mono">
                    ¥{record.totalAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </td>
                  <td>{record.itemCount}</td>
                  <td className="text-gray-500">
                    {format(record.createdAt, "yyyy-MM-dd HH:mm")}
                  </td>
                  <td>
                    <Link
                      href={`/outbound/${record.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
              {recordsWithDetails.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    暂无出库记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
