CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`kind` text NOT NULL,
	`vehicle_id` text,
	`service_id` text,
	`vehicle_details` text,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text DEFAULT 'store' NOT NULL,
	`amount` integer NOT NULL,
	`deposit` integer DEFAULT 0 NOT NULL,
	`driver` integer DEFAULT 0 NOT NULL,
	`delivery` text DEFAULT 'office' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`idempotency_key` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_reference_unique` ON `bookings` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_idempotency_key_unique` ON `bookings` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`phone` text,
	`email` text,
	`interest` text NOT NULL,
	`source` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`external_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_external_id_unique` ON `leads` (`external_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`body` text NOT NULL,
	`direction` text NOT NULL,
	`channel` text NOT NULL,
	`external_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_external_id_unique` ON `messages` (`external_id`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`duration` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`year` integer NOT NULL,
	`seats` integer DEFAULT 5 NOT NULL,
	`transmission` text DEFAULT 'Automático' NOT NULL,
	`fuel` text DEFAULT 'Gasolina' NOT NULL,
	`daily_rate` integer NOT NULL,
	`sale_price` integer,
	`status` text DEFAULT 'available' NOT NULL,
	`image` text NOT NULL,
	`plate` text NOT NULL,
	`mileage` integer DEFAULT 0 NOT NULL,
	`owner_id` text,
	`approved` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_plate_unique` ON `vehicles` (`plate`);