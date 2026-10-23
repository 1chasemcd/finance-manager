CREATE TABLE `group_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`public_id` text NOT NULL UNIQUE,
	`group_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT `fk_group_invites_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`),
	CONSTRAINT `fk_group_invites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subject` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `group_id` integer NOT NULL REFERENCES groups(id);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`subject` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`group_id` integer NOT NULL,
	CONSTRAINT `fk_users_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `first_name`, `last_name`) SELECT `id`, `first_name`, `last_name` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;