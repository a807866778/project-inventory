import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { OutboundForm } from "../form";

export default async function NewOutboundPage() {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("outbound:create")) {
    redirect("/outbound");
  }

  const projects = await db
    .select()
    .from(schema.projects)
    .orderBy(schema.projects.createdAt);

  const materials = await db.select().from(schema.materials);

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">新建出库单</h1>
      <div className="card p-6">
        <OutboundForm
          projects={projects}
          materials={materials}
          operatorId={user!.id}
        />
      </div>
    </div>
  );
}
