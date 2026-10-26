CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`archived` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_categories_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`)
);
--> statement-breakpoint
CREATE TABLE `category_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`pattern` text NOT NULL,
	`category_id` integer,
	CONSTRAINT `fk_category_rules_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `category_rules_category_group_fk` FOREIGN KEY (`category_id`,`group_id`) REFERENCES `categories`(`id`,`group_id`)
);
--> statement-breakpoint
CREATE TABLE `file_formats` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`name` text NOT NULL,
	`skip_rows` integer NOT NULL,
	`row_pattern` text,
	`date_index` integer NOT NULL,
	`summary_index` integer NOT NULL,
	`amount_index` integer NOT NULL,
	`date_format` text,
	`positive_is_spending` integer NOT NULL,
	CONSTRAINT `fk_file_formats_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`archived` integer DEFAULT false NOT NULL,
	`owner_id` integer,
	`file_format_id` integer,
	CONSTRAINT `fk_sources_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `sources_owner_group_fk` FOREIGN KEY (`owner_id`,`group_id`) REFERENCES `users`(`id`,`group_id`),
	CONSTRAINT `sources_file_format_group_fk` FOREIGN KEY (`owner_id`,`group_id`) REFERENCES `file_formats`(`id`,`group_id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`group_id` integer NOT NULL,
	`date` integer NOT NULL,
	`amount` integer NOT NULL,
	`summary` text,
	`category_id` integer NOT NULL,
	`source_id` integer NOT NULL,
	CONSTRAINT `fk_transactions_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `transactions_source_group_fk` FOREIGN KEY (`source_id`,`group_id`) REFERENCES `sources`(`id`,`group_id`),
	CONSTRAINT `transactions_category_group_fk` FOREIGN KEY (`category_id`,`group_id`) REFERENCES `categories`(`id`,`group_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_id_group_id_uq` ON `categories` (`id`,`group_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `file_formats_id_group_id_uq` ON `file_formats` (`id`,`group_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sources_id_group_id_uq` ON `sources` (`id`,`group_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_group_id_uq` ON `users` (`id`,`group_id`);