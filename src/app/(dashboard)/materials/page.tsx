import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function MaterialsPage() {
  const user = await getCurrentUser();
  const canCreate = user?.permissions.includes("material:create");

  // 获取所有物料和分类
  const allMaterials = await db
    .select()
    .from(schema.materials)
    .orderBy(desc(schema.materials.updatedAt));

  const categories = await db.select().from(schema.categories);

  const materialsWithCategory = await Promise.all(
    allMaterials.map(async (material) => {
      const category = material.categoryId
        ? categories.find((c) => c.id === material.categoryId)
        : null;
      return {
        ...material,
        categoryName: category?.name || "未分类",
        isLowStock:
          material.stockQuantity <= material.minStockWarning &&
          material.minStockWarning > 0,
      };
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">物料管理</h1>
        {canCreate && (
          <Link href="/materials/new" className="btn-primary">
            + 添加物料
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>物料名称</th>
                <th>分类</th>
                <th>规格型号</th>
                <th>单位</th>
                <th className="text-right">采购价</th>
                <th className="text-right">结算价</th>
                <th className="text-right">库存</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {materialsWithCategory.map((material) => (
                <tr key={material.id}>
                  <td className="font-medium text-gray-900">
                    {material.name}
                  </td>
                  <td>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {material.categoryName}
                    </span>
                  </td>
                  <td className="text-gray-500">{material.spec || "-"}</td>
                  <td>{material.unit}</td>
                  <td className="text-right font-mono">
                    ¥{material.purchasePrice.toFixed(2)}
                  </td>
                  <td className="text-right font-mono text-green-600">
                    ¥{material.salePrice.toFixed(2)}
                  </td>
                  <td className="text-right">
                    <span
                      className={`font-mono ${
                        material.isLowStock
                          ? "text-orange-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {material.stockQuantity}
                    </span>
                    <span className="text-gray-400 ml-1">{material.unit}</span>
                    {material.isLowStock && (
                      <span className="ml-2 text-xs text-orange-500">⚠️</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/materials/${material.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        详情
                      </Link>
                      {user?.permissions.includes("material:update") && (
                        <Link
                          href={`/materials/${material.id}/edit`}
                          className="text-gray-600 hover:text-gray-700 text-sm"
                        >
                          编辑
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {materialsWithCategory.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    暂无物料，{canCreate && <Link href="/materials/new" className="text-primary-600">添加第一个物料</Link>}
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
