CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subject` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `account_id` integer NOT NULL REFERENCES accounts(id);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`subject` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`account_id` integer NOT NULL,
	CONSTRAINT `fk_users_account_id_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `first_name`, `last_name`) SELECT `id`, `first_name`, `last_name` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;