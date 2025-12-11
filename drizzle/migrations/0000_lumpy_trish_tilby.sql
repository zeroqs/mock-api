-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `_prisma_migrations` (
	`id` text PRIMARY KEY NOT NULL,
	`checksum` text NOT NULL,
	`finished_at` numeric,
	`migration_name` text NOT NULL,
	`logs` text,
	`rolled_back_at` numeric,
	`started_at` numeric DEFAULT (current_timestamp) NOT NULL,
	`applied_steps_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `MockEndpoint` (
	`id` text PRIMARY KEY NOT NULL,
	`method` text NOT NULL,
	`path` text NOT NULL,
	`description` text,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `MockEndpoint_method_path_key` ON `MockEndpoint` (`method`,`path`);--> statement-breakpoint
CREATE INDEX `MockEndpoint_method_path_idx` ON `MockEndpoint` (`method`,`path`);--> statement-breakpoint
CREATE TABLE `MockPreset` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`enabled` numeric DEFAULT false NOT NULL,
	`statusCode` integer DEFAULT 200 NOT NULL,
	`responseData` numeric NOT NULL,
	`filterKeys` numeric DEFAULT ([]),
	`mockEndpointId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL,
	FOREIGN KEY (`mockEndpointId`) REFERENCES `MockEndpoint`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `MockPreset_mockEndpointId_enabled_idx` ON `MockPreset` (`mockEndpointId`,`enabled`);--> statement-breakpoint
CREATE INDEX `MockPreset_mockEndpointId_idx` ON `MockPreset` (`mockEndpointId`);
*/