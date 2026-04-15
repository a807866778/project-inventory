import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { format } from "date-fns";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const canCreate = user?.permissions.includes("project:create");

  const projects = await db
    .select()
    .from(schema.projects)
    .orderBy(desc(schema.projects.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">项目管理</h1>
        {canCreate && (
          <Link href="/projects/new" className="btn-primary">
            + 新建项目
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const statusColors: Record<string, string> = {
            进行中: "bg-green-100 text-green-800",
            已完成: "bg-blue-100 text-blue-800",
            已归档: "bg-gray-100 text-gray-800",
          };

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="card p-4 hover:shadow-md transition-shadow h-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      statusColors[project.status] || "bg-gray-100"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.clientName && (
                  <div className="text-sm text-gray-500 mb-1">
                    甲方: {project.clientName}
                  </div>
                )}

                {project.address && (
                  <div className="text-sm text-gray-400 mb-3 truncate">
                    📍 {project.address}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-400">产值</div>
                    <div className="text-sm font-semibold text-green-600 font-mono truncate">
                      ¥{project.totalRevenue.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">成本</div>
                    <div className="text-sm font-semibold text-orange-600 font-mono truncate">
                      ¥{project.totalCost.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">利润</div>
                    <div
                      className={`text-sm font-semibold font-mono truncate ${
                        project.totalProfit >= 0 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      ¥{project.totalProfit.toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mt-3">
                  创建于 {format(project.createdAt, "yyyy-MM-dd")}
                </div>
              </div>
            </Link>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            暂无项目，{canCreate && <Link href="/projects/new" className="text-primary-600">创建第一个项目</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
