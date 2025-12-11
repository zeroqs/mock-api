import { sqliteTable, AnySQLiteColumn, text, numeric, integer, uniqueIndex, index, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const prismaMigrations = sqliteTable("_prisma_migrations", {
	id: text().primaryKey().notNull(),
	checksum: text().notNull(),
	finishedAt: numeric("finished_at"),
	migrationName: text("migration_name").notNull(),
	logs: text(),
	rolledBackAt: numeric("rolled_back_at"),
	startedAt: numeric("started_at").default(sql`(current_timestamp)`).notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const mockEndpoint = sqliteTable("MockEndpoint", {
	id: text().primaryKey().notNull(),
	method: text().notNull(),
	path: text().notNull(),
	description: text(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: numeric().notNull(),
},
(table) => [
	uniqueIndex("MockEndpoint_method_path_key").on(table.method, table.path),
	index("MockEndpoint_method_path_idx").on(table.method, table.path),
]);

export const mockPreset = sqliteTable("MockPreset", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	enabled: numeric().notNull(),
	statusCode: integer().default(200).notNull(),
	responseData: numeric().notNull(),
	filterKeys: numeric().default('[]'),
	mockEndpointId: text().notNull().references(() => mockEndpoint.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: numeric().notNull(),
},
(table) => [
	index("MockPreset_mockEndpointId_enabled_idx").on(table.mockEndpointId, table.enabled),
	index("MockPreset_mockEndpointId_idx").on(table.mockEndpointId),
]);

