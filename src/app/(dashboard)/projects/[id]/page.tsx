export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id),
  });

  if (!project) {
    notFound();
  }

  // 获取该项目的所有出库记录
  const outboundRecords = await db
    .select()
    .from(schema.outboundRecords)
    .where(eq(schema.outboundRecords.projectId, id))
    .orderBy(desc(schema.outboundRecords.createdAt));

  // 获取所有出库明细
  const allItems = await Promise.all(
    outboundRecords.map(async (record) => {
      const items = await db
        .select({
          id: schema.outboundItems.id,
          materialId: schema.outboundItems.materialId,
          quantity: schema.outboundItems.quantity,
          unitPrice: schema.outboundItems.unitPrice,
          createdAt: schema.outboundItems.createdAt,
        })
        .from(schema.outboundItems)
        .where(eq(schema.outboundItems.outboundId, record.id));

      return { record, items };
    })
  );

  // 汇总物料使用情况
  const materialSummary: Record<
    string,
    {
      name: string;
      spec: string | null;
      unit: string;
      totalQuantity: number;
      purchasePrice: number;
      salePrice: number;
      totalCost: number;
      totalRevenue: number;
    }
  > = {};

  for (const { items } of allItems) {
    for (const item of items) {
      const material = await db.query.materials.findFirst({
        where: eq(schema.materials.id, item.materialId),
      });

      if (material) {
        if (!materialSummary[item.materialId]) {
          materialSummary[item.materialId] = {
            name: material.name,
            spec: material.spec,
            unit: material.unit,
            totalQuantity: 0,
            purchasePrice: material.purchasePrice,
            salePrice: material.salePrice,
            totalCost: 0,
            totalRevenue: 0,
          };
        }
        materialSummary[item.materialId].totalQuantity += item.quantity;
        materialSummary[item.materialId].totalCost +=
          item.quantity * material.purchasePrice;
        materialSummary[item.materialId].totalRevenue +=
          item.quantity * item.unitPrice;
      }
    }
  }

  const statusColors: Record<string, string> = {
    进行中: "bg-green-100 text-green-800",
    已完成: "bg-blue-100 text-blue-800",
    已归档: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* 项目信息 */}
      <div className="card p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            {project.clientName && (
              <p className="text-gray-500 mt-1">甲方: {project.clientName}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              statusColors[project.status] || "bg-gray-100"
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">联系电话</div>
            <div className="text-gray-900">{project.contactPhone || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">项目地址</div>
            <div className="text-gray-900 truncate">{project.address || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">开始日期</div>
            <div className="text-gray-900">
              {project.startDate ? format(project.startDate, "yyyy-MM-dd") : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">结束日期</div>
            <div className="text-gray-900">
              {project.endDate ? format(project.endDate, "yyyy-MM-dd") : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* 成本统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 bg-green-50">
          <div className="text-sm text-green-600">产值</div>
          <div className="text-2xl font-bold text-green-700 font-mono">
            ¥{project.totalRevenue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card p-4 bg-orange-50">
          <div className="text-sm text-orange-600">成本</div>
          <div className="text-2xl font-bold text-orange-700 font-mono">
            ¥{project.totalCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card p-4 bg-blue-50">
          <div className="text-sm text-blue-600">利润</div>
          <div
            className={`text-2xl font-bold font-mono ${
              project.totalProfit >= 0 ? "text-blue-700" : "text-red-700"
            }`}
          >
            ¥{project.totalProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 物料使用明细 */}
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">物料使用明细</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>物料名称</th>
                <th>规格型号</th>
                <th className="text-right">用量</th>
                <th className="text-right">单位</th>
                <th className="text-right">采购价</th>
                <th className="text-right">结算价</th>
                <th className="text-right">成本</th>
                <th className="text-right">产值</th>
                <th className="text-right">利润</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(materialSummary).map(([materialId, summary]) => (
                <tr key={materialId}>
                  <td className="font-medium">{summary.name}</td>
                  <td className="text-gray-500">{summary.spec || "-"}</td>
                  <td className="text-right font-mono">{summary.totalQuantity}</td>
                  <td>{summary.unit}</td>
                  <td className="text-right font-mono">
                    ¥{summary.purchasePrice.toFixed(2)}
                  </td>
                  <td className="text-right font-mono">
                    ¥{summary.salePrice.toFixed(2)}
                  </td>
                  <td className="text-right font-mono text-orange-600">
                    ¥{summary.totalCost.toFixed(2)}
                  </td>
                  <td className="text-right font-mono text-green-600">
                    ¥{summary.totalRevenue.toFixed(2)}
                  </td>
                  <td
                    className={`text-right font-mono font-semibold ${
                      summary.totalRevenue - summary.totalCost >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    ¥{(summary.totalRevenue - summary.totalCost).toFixed(2)}
                  </td>
                </tr>
              ))}
              {Object.keys(materialSummary).length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    暂无物料使用记录
                  </td>
                </tr>
              )}
            </tbody>
            {Object.keys(materialSummary).length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={6} className="text-right">合计</td>
                  <td className="text-right font-mono text-orange-600">
                    ¥{project.totalCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right font-mono text-green-600">
                    ¥{project.totalRevenue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`text-right font-mono ${
                    project.totalProfit >= 0 ? "text-blue-600" : "text-red-600"
                  }`}>
                    ¥{project.totalProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 出库记录列表 */}
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">出库记录</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {outboundRecords.map((record) => (
            <div key={record.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-mono text-sm text-gray-500">
                  {record.id.slice(0, 8)}
                </div>
                <div className="text-sm text-gray-500">
                  {format(record.createdAt, "yyyy-MM-dd HH:mm")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-green-600">
                  ¥{record.totalAmount.toFixed(2)}
                </div>
                {record.remark && (
                  <div className="text-xs text-gray-400">{record.remark}</div>
                )}
              </div>
            </div>
          ))}
          {outboundRecords.length === 0 && (
            <div className="p-8 text-center text-gray-400">暂无出库记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
