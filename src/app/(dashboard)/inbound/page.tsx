import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default async function InboundPage() {
  const user = await getCurrentUser();
  const canCreate = user?.permissions.includes("inbound:create");

  // 获取所有入库记录
  const records = await db
    .select()
    .from(schema.inboundRecords)
    .orderBy(desc(schema.inboundRecords.createdAt))
    .limit(50);

  // 获取关联信息
  const recordsWithDetails = await Promise.all(
    records.map(async (record) => {
      const supplier = record.supplierId
        ? await db.query.suppliers.findFirst({
            where: eq(schema.suppliers.id, record.supplierId),
          })
        : null;

      const operator = await db.query.users.findFirst({
        where: eq(schema.users.id, record.operatorId),
      });

      const items = await db
        .select()
        .from(schema.inboundItems)
        .where(eq(schema.inboundItems.inboundId, record.id));

      return {
        ...record,
        supplierName: supplier?.name || "未知供应商",
        operatorName: operator?.realName || "未知",
        itemCount: items.length,
      };
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">入库管理</h1>
        {canCreate && (
          <Link href="/inbound/new" className="btn-primary">
            + 新建入库单
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>入库单号</th>
                <th>供应商</th>
                <th>操作员</th>
                <th className="text-right">总金额</th>
                <th>物料数</th>
                <th>入库时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {recordsWithDetails.map((record) => (
                <tr key={record.id}>
                  <td className="font-mono text-sm">{record.id.slice(0, 8)}</td>
                  <td>{record.supplierName}</td>
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
                      href={`/inbound/${record.id}`}
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
                    暂无入库记录
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
