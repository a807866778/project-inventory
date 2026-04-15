export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { ProjectForm } from "../form";

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("project:create")) {
    redirect("/projects");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">新建项目</h1>
      <div className="card p-6">
        <ProjectForm />
      </div>
    </div>
  );
}
