export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc, gte, lt, and } from "drizzle-orm";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default async function DailyReportPage() {
  const user = await getCurrentUser();

  const today = new Date();
  const todayStart = startOfDay(today);

  // 今日出库记录
  const todayOutbounds = await db
    .select()
    .from(schema.outboundRecords)
    .where(gte(schema.outboundRecords.createdAt, todayStart));

  // 今日入库记录
  const todayInbounds = await db
    .select()
    .from(schema.inboundRecords)
    .where(gte(schema.inboundRecords.createdAt, todayStart));

  // 计算今日统计数据
  let todayRevenue = 0;
  let todayCost = 0;
  let todayOutboundCount = 0;
  let todayInboundCount = 0;

  for (const record of todayOutbounds) {
    todayOutboundCount++;
    const items = await db
      .select()
      .from(schema.outboundItems)
      .where(eq(schema.outboundItems.outboundId, record.id));

    for (const item of items) {
      const material = await db.select().from(schema.materials).where(eq(schema.materials.id,  item.materialId)).get();
      if (material) {
        todayRevenue += item.quantity * material.salePrice;
        todayCost += item.quantity * material.purchasePrice;
      }
    }
  }

  for (const record of todayInbounds) {
    todayInboundCount++;
  }

  // 本周数据
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const weekOutbounds = await db
    .select()
    .from(schema.outboundRecords)
    .where(and(
      gte(schema.outboundRecords.createdAt, weekStart),
      lt(schema.outboundRecords.createdAt, weekEnd)
    ));

  let weekRevenue = 0;
  let weekCost = 0;

  for (const record of weekOutbounds) {
    const items = await db
      .select()
      .from(schema.outboundItems)
      .where(eq(schema.outboundItems.outboundId, record.id));

    for (const item of items) {
      const material = await db.select().from(schema.materials).where(eq(schema.materials.id,  item.materialId)).get();
      if (material) {
        weekRevenue += item.quantity * material.salePrice;
        weekCost += item.quantity * material.purchasePrice;
      }
    }
  }

  // 本月数据
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const monthOutbounds = await db
    .select()
    .from(schema.outboundRecords)
    .where(and(
      gte(schema.outboundRecords.createdAt, monthStart),
      lt(schema.outboundRecords.createdAt, monthEnd)
    ));

  let monthRevenue = 0;
  let monthCost = 0;

  for (const record of monthOutbounds) {
    const items = await db
      .select()
      .from(schema.outboundItems)
      .where(eq(schema.outboundItems.outboundId, record.id));

    for (const item of items) {
      const material = await db.select().from(schema.materials).where(eq(schema.materials.id,  item.materialId)).get();
      if (material) {
        monthRevenue += item.quantity * material.salePrice;
        monthCost += item.quantity * material.purchasePrice;
      }
    }
  }

  const todayProfit = todayRevenue - todayCost;
  const weekProfit = weekRevenue - weekCost;
  const monthProfit = monthRevenue - monthCost;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">收益报表</h1>

      <div className="card p-4">
        <div className="text-sm text-gray-500">
          报表日期: {format(today, "yyyy年MM月dd日")}
        </div>
      </div>

      {/* 今日数据 */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">今日统计</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">产值</div>
            <div className="text-2xl font-bold text-green-700 font-mono">
              ¥{todayRevenue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-orange-600 mb-1">成本</div>
            <div className="text-2xl font-bold text-orange-700 font-mono">
              ¥{todayCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">利润</div>
            <div className={`text-2xl font-bold font-mono ${
              todayProfit >= 0 ? "text-blue-700" : "text-red-700"
            }`}>
              ¥{todayProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">出库单数</div>
            <div className="text-2xl font-bold text-gray-700">
              {todayOutboundCount}
            </div>
          </div>
        </div>
      </div>

      {/* 本周数据 */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          本周统计 ({format(weekStart, "MM/dd")} - {format(weekEnd, "MM/dd")})
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">产值</div>
            <div className="text-xl font-bold text-green-700 font-mono">
              ¥{weekRevenue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-orange-600 mb-1">成本</div>
            <div className="text-xl font-bold text-orange-700 font-mono">
              ¥{weekCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">利润</div>
            <div className={`text-xl font-bold font-mono ${
              weekProfit >= 0 ? "text-blue-700" : "text-red-700"
            }`}>
              ¥{weekProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* 本月数据 */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          本月统计 ({format(monthStart, "yyyy年MM月")})
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">产值</div>
            <div className="text-xl font-bold text-green-700 font-mono">
              ¥{monthRevenue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-orange-600 mb-1">成本</div>
            <div className="text-xl font-bold text-orange-700 font-mono">
              ¥{monthCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">利润</div>
            <div className={`text-xl font-bold font-mono ${
              monthProfit >= 0 ? "text-blue-700" : "text-red-700"
            }`}>
              ¥{monthProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
