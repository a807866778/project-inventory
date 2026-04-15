export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 物料总数
  const allMaterials = await db.select().from(schema.materials);
  const totalMaterials = allMaterials.length;

  // 低库存预警
  const lowStockMaterials = allMaterials.filter(
    (m) => m.stockQuantity <= m.minStockWarning && m.minStockWarning > 0
  );

  // 进行中项目数
  const allProjects = await db.select().from(schema.projects);
  const activeProjects = allProjects.filter((p) => p.status === "进行中").length;

  // 今日出库记录
  const todayOutbounds = await db
    .select()
    .from(schema.outboundRecords)
    .where(gte(schema.outboundRecords.createdAt, today));

  // 今日入库记录
  const todayInbounds = await db
    .select()
    .from(schema.inboundRecords)
    .where(gte(schema.inboundRecords.createdAt, today));

  // 计算今日产值和利润
  let todayRevenue = 0;
  let todayCost = 0;

  for (const record of todayOutbounds) {
    const items = await db
      .select()
      .from(schema.outboundItems)
      .where(eq(schema.outboundItems.outboundId, record.id));

    for (const item of items) {
      const material = await db.query.materials.findFirst({
        where: eq(schema.materials.id, item.materialId),
      });
      if (material) {
        todayRevenue += item.quantity * material.salePrice;
        todayCost += item.quantity * material.purchasePrice;
      }
    }
  }

  // 最近的出库记录
  const recentOutbounds = await db
    .select({
      id: schema.outboundRecords.id,
      projectId: schema.outboundRecords.projectId,
      operatorId: schema.outboundRecords.operatorId,
      totalAmount: schema.outboundRecords.totalAmount,
      createdAt: schema.outboundRecords.createdAt,
    })
    .from(schema.outboundRecords)
    .orderBy(desc(schema.outboundRecords.createdAt))
    .limit(5);

  // 获取项目名称
  const recentOutboundsWithProject = await Promise.all(
    recentOutbounds.map(async (record) => {
      const project = await db.query.projects.findFirst({
        where: eq(schema.projects.id, record.projectId),
      });
      return {
        ...record,
        projectName: project?.name || "未知项目",
      };
    })
  );

  // 库存预警列表
  const lowStockWithDetails = await Promise.all(
    lowStockMaterials.slice(0, 5).map(async (material) => {
      const category = material.categoryId
        ? await db.query.categories.findFirst({
            where: eq(schema.categories.id, material.categoryId),
          })
        : null;
      return {
        ...material,
        categoryName: category?.name || "未分类",
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">物料种类</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {totalMaterials}
          </div>
          <Link
            href="/materials"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            查看全部 →
          </Link>
        </div>

        <div className="card p-4">
          <div className="text-sm text-gray-500">进行中项目</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {activeProjects}
          </div>
          <Link
            href="/projects"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            查看全部 →
          </Link>
        </div>

        <div className="card p-4">
          <div className="text-sm text-gray-500">今日产值</div>
          <div className="text-2xl font-bold text-green-600 mt-1 font-mono">
            ¥{todayRevenue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400">
            成本 ¥{todayCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm text-gray-500">库存预警</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {lowStockMaterials.length}
          </div>
          {lowStockMaterials.length > 0 && (
            <div className="text-xs text-orange-500">需要及时补货</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 今日动态 */}
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">今日动态</h2>
          </div>
          <div className="p-4">
            <div className="flex gap-6">
              <div>
                <div className="text-sm text-gray-500">入库单</div>
                <div className="text-xl font-bold text-primary-600">
                  {todayInbounds.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">出库单</div>
                <div className="text-xl font-bold text-primary-600">
                  {todayOutbounds.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">今日利润</div>
                <div className="text-xl font-bold text-green-600 font-mono">
                  ¥{(todayRevenue - todayCost).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {recentOutboundsWithProject.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">最近出库</div>
                <div className="space-y-2">
                  {recentOutboundsWithProject.map((record) => (
                    <Link
                      key={record.id}
                      href={`/outbound`}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {record.projectName}
                      </span>
                      <span className="text-sm font-mono text-gray-500">
                        {format(record.createdAt, "HH:mm")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 库存预警 */}
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">库存预警</h2>
            <Link
              href="/materials"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              查看全部
            </Link>
          </div>
          <div className="p-4">
            {lowStockWithDetails.length > 0 ? (
              <div className="space-y-3">
                {lowStockWithDetails.map((material) => (
                  <div
                    key={material.id}
                    className="flex justify-between items-center py-2 px-3 rounded-lg bg-orange-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {material.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {material.categoryName} · {material.spec}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-600">
                        {material.stockQuantity}
                        {material.unit}
                      </div>
                      <div className="text-xs text-gray-400">
                        预警: {material.minStockWarning}
                        {material.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                暂无库存预警
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="card p-4">
        <h2 className="font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/inbound/new"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <span className="text-xl">📥</span>
            <span className="font-medium">新建入库</span>
          </Link>

          <Link
            href="/outbound/new"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
          >
            <span className="text-xl">📤</span>
            <span className="font-medium">新建出库</span>
          </Link>

          <Link
            href="/materials/new"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <span className="text-xl">📦</span>
            <span className="font-medium">添加物料</span>
          </Link>

          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <span className="text-xl">🏗️</span>
            <span className="font-medium">新建项目</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
