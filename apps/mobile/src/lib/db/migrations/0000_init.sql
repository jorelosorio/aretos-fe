CREATE TABLE `diary_note_tags` (
	`diary_note_id` text NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`diary_note_id`, `name`),
	FOREIGN KEY (`diary_note_id`) REFERENCES `diary_notes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `diary_note_tags_name_idx` ON `diary_note_tags` (lower("name"));--> statement-breakpoint
CREATE TABLE `diary_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`diary_id` text,
	`habit_log_id` text,
	`entry_date` text NOT NULL,
	`body` text NOT NULL,
	`listed_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`check_in` text,
	CONSTRAINT "diary_notes_body_check" CHECK(trim("diary_notes"."body") <> '' AND length("diary_notes"."body") <= 2000)
);
--> statement-breakpoint
CREATE INDEX `diary_notes_listed_idx` ON `diary_notes` (`listed_at`,`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `diary_notes_entry_date_idx` ON `diary_notes` (`entry_date`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity` text NOT NULL,
	`row_id` text NOT NULL,
	`op` text NOT NULL,
	`payload` text NOT NULL,
	`sending` integer DEFAULT false NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `outbox_row_idx` ON `outbox` (`entity`,`row_id`);--> statement-breakpoint
CREATE TABLE `sync_rows` (
	`entity` text NOT NULL,
	`row_id` text NOT NULL,
	`server_version` integer,
	`state` text NOT NULL,
	`error_code` text,
	`deleted` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`entity`, `row_id`)
);
--> statement-breakpoint
CREATE TABLE `sync_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
