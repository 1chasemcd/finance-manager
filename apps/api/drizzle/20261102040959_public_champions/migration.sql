CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`public_id` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`description` text,
	`archived` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_categories_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `categories_group_id_uq` UNIQUE(`group_id`,`id`),
	CONSTRAINT `categories_group_name_uq` UNIQUE(`group_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `category_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`public_id` text NOT NULL UNIQUE,
	`pattern` text NOT NULL,
	`category_id` integer,
	CONSTRAINT `fk_category_rules_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `category_rules_group_category_fk` FOREIGN KEY (`group_id`,`category_id`) REFERENCES `categories`(`group_id`,`id`),
	CONSTRAINT `category_rules_group_pattern_uq` UNIQUE(`group_id`,`pattern`)
);
--> statement-breakpoint
CREATE TABLE `file_formats` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`public_id` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`skip_rows` integer NOT NULL,
	`row_pattern` text,
	`date_index` integer NOT NULL,
	`summary_index` integer NOT NULL,
	`amount_index` integer NOT NULL,
	`date_format` text,
	`positive_is_spending` integer NOT NULL,
	CONSTRAINT `fk_file_formats_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `file_formats_group_id_uq` UNIQUE(`group_id`,`id`),
	CONSTRAINT `file_formats_group_name_uq` UNIQUE(`group_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`public_id` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`description` text,
	`archived` integer DEFAULT false NOT NULL,
	`owner_id` integer NOT NULL,
	`file_format_id` integer,
	CONSTRAINT `fk_sources_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `sources_group_owner_fk` FOREIGN KEY (`group_id`,`owner_id`) REFERENCES `users`(`group_id`,`id`),
	CONSTRAINT `sources_group_file_format_fk` FOREIGN KEY (`group_id`,`file_format_id`) REFERENCES `file_formats`(`group_id`,`id`),
	CONSTRAINT `sources_group_id_uq` UNIQUE(`group_id`,`id`),
	CONSTRAINT `sources_group_name_uq` UNIQUE(`group_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`public_id` text NOT NULL UNIQUE,
	`date` integer NOT NULL,
	`amount` integer NOT NULL,
	`summary` text,
	`category_id` integer NOT NULL,
	`source_id` integer NOT NULL,
	CONSTRAINT `fk_transactions_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `transactions_group_source_fk` FOREIGN KEY (`group_id`,`source_id`) REFERENCES `sources`(`group_id`,`id`),
	CONSTRAINT `transactions_group_category_fk` FOREIGN KEY (`group_id`,`category_id`) REFERENCES `categories`(`group_id`,`id`)
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_group_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`public_id` text NOT NULL UNIQUE,
	`user_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT `fk_group_invites_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `fk_group_invites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `group_invites_group_user_uq` UNIQUE(`group_id`,`user_id`)
);
--> statement-breakpoint
INSERT INTO `__new_group_invites`(`id`, `public_id`, `group_id`, `user_id`, `created_at`) SELECT `id`, `public_id`, `group_id`, `user_id`, `created_at` FROM `group_invites`;--> statement-breakpoint
DROP TABLE `group_invites`;--> statement-breakpoint
ALTER TABLE `__new_group_invites` RENAME TO `group_invites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`subject` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	CONSTRAINT `fk_users_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `users_group_id_uq` UNIQUE(`group_id`,`id`)
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `subject`, `email`, `first_name`, `last_name`, `group_id`) SELECT `id`, `subject`, `email`, `first_name`, `last_name`, `group_id` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;