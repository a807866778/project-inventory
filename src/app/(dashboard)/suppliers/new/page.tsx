export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { SupplierForm } from "../form";

export default async function NewSupplierPage() {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("supplier:create")) {
    redirect("/suppliers");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">添加供应商</h1>
      <div className="card p-6">
        <SupplierForm />
      </div>
    </div>
  );
}
