import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============ 认证相关 ============

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  realName: text("real_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// ============ 角色权限 ============

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  permissions: text("permissions").notNull(), // JSON array
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  roleId: text("role_id").notNull().references(() => roles.id),
});

// ============ 物料分类 ============

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  sort: integer("sort").default(0),
});

// ============ 物料台账 ============

export const materials = sqliteTable("materials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  unit: text("unit").notNull(), // 米、台、个、箱等
  spec: text("spec"), // 规格型号
  purchasePrice: real("purchase_price").notNull().default(0), // 采购价
  salePrice: real("sale_price").notNull().default(0), // 结算价
  stockQuantity: real("stock_quantity").notNull().default(0), // 库存数量
  minStockWarning: real("min_stock_warning").notNull().default(0), // 最小库存预警
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ============ 供应商 ============

export const suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  address: text("address"),
  remark: text("remark"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ 项目 ============

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clientName: text("client_name"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  status: text("status").notNull().default("进行中"), // 进行中/已完成/已归档
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  totalRevenue: real("total_revenue").notNull().default(0), // 产值
  totalCost: real("total_cost").notNull().default(0), // 成本
  totalProfit: real("total_profit").notNull().default(0), // 利润
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ 入库 ============

export const inboundRecords = sqliteTable("inbound_records", {
  id: text("id").primaryKey(),
  supplierId: text("supplier_id").references(() => suppliers.id),
  operatorId: text("operator_id").notNull().references(() => users.id),
  totalAmount: real("total_amount").notNull().default(0),
  remark: text("remark"),
  photoUrl: text("photo_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const inboundItems = sqliteTable("inbound_items", {
  id: text("id").primaryKey(),
  inboundId: text("inbound_id").notNull().references(() => inboundRecords.id),
  materialId: text("material_id").notNull().references(() => materials.id),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ 出库 ============

export const outboundRecords = sqliteTable("outbound_records", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  operatorId: text("operator_id").notNull().references(() => users.id),
  totalAmount: real("total_amount").notNull().default(0),
  remark: text("remark"),
  photoUrl: text("photo_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const outboundItems = sqliteTable("outbound_items", {
  id: text("id").primaryKey(),
  outboundId: text("outbound_id").notNull().references(() => outboundRecords.id),
  materialId: text("material_id").notNull().references(() => materials.id),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ 工具借用 ============

export const toolBorrows = sqliteTable("tool_borrows", {
  id: text("id").primaryKey(),
  toolId: text("tool_id").notNull().references(() => materials.id),
  borrowerId: text("borrower_id").notNull().references(() => users.id),
  projectId: text("project_id").references(() => projects.id),
  borrowDate: integer("borrow_date", { mode: "timestamp" }).notNull(),
  returnDate: integer("return_date", { mode: "timestamp" }),
  status: text("status").notNull().default("借用中"), // 借用中/已归还
});

// ============ 类型导出 ============

export type User = typeof users.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InboundRecord = typeof inboundRecords.$inferSelect;
export type InboundItem = typeof inboundItems.$inferSelect;
export type OutboundRecord = typeof outboundRecords.$inferSelect;
export type OutboundItem = typeof outboundItems.$inferSelect;
export type Role = typeof roles.$inferSelect;
