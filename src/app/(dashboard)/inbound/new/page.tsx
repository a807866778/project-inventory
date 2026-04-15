export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { InboundForm } from "../form";

export default async function NewInboundPage() {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("inbound:create")) {
    redirect("/inbound");
  }

  const suppliers = await db.select().from(schema.suppliers);
  const materials = await db.select().from(schema.materials);

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">新建入库单</h1>
      <div className="card p-6">
        <InboundForm
          suppliers={suppliers}
          materials={materials}
          operatorId={user!.id}
        />
      </div>
    </div>
  );
}
