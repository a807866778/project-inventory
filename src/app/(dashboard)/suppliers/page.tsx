import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function SuppliersPage() {
  const user = await getCurrentUser();
  const canCreate = user?.permissions.includes("supplier:create");

  const suppliers = await db
    .select()
    .from(schema.suppliers)
    .orderBy(desc(schema.suppliers.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">供应商管理</h1>
        {canCreate && (
          <Link href="/suppliers/new" className="btn-primary">
            + 添加供应商
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{supplier.name}</h3>
            {supplier.contactPerson && (
              <div className="text-sm text-gray-500 mb-1">
                联系人: {supplier.contactPerson}
              </div>
            )}
            {supplier.phone && (
              <div className="text-sm text-gray-500 mb-1">📞 {supplier.phone}</div>
            )}
            {supplier.address && (
              <div className="text-sm text-gray-400 truncate mb-2">
                📍 {supplier.address}
              </div>
            )}
            {supplier.remark && (
              <div className="text-xs text-gray-400 italic truncate">
                {supplier.remark}
              </div>
            )}
          </div>
        ))}

        {suppliers.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            暂无供应商
          </div>
        )}
      </div>
    </div>
  );
}
