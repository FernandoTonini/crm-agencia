ALTER TABLE `contracts` ADD `createdBy` varchar(255);--> statement-breakpoint
ALTER TABLE `contracts` ADD `lastModifiedBy` varchar(255);--> statement-breakpoint
ALTER TABLE `contracts` ADD `lastModifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `leads` ADD `lastModifiedBy` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `lastModifiedAt` timestamp;