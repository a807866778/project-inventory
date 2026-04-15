export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { MaterialForm } from "../form";

export default async function NewMaterialPage() {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("material:create")) {
    redirect("/materials");
  }

  const categories = await db.select().from(schema.categories);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">添加物料</h1>
      <div className="card p-6">
        <MaterialForm categories={categories} />
      </div>
    </div>
  );
}
