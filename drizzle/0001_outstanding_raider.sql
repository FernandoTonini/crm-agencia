CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`contractValue` int NOT NULL,
	`contractDuration` int NOT NULL,
	`services` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`renewalNotified` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`instagram` varchar(255),
	`score` int NOT NULL,
	`classification` enum('Quente','Morno','Frio') NOT NULL,
	`question1` text,
	`question2` text,
	`question3` text,
	`question4` text,
	`question5` text,
	`question6` text,
	`question7` text,
	`ipAddress` varchar(100),
	`locationCity` varchar(255),
	`locationState` varchar(255),
	`locationCountry` varchar(255),
	`locationLatitude` varchar(50),
	`locationLongitude` varchar(50),
	`status` enum('novo','contatado','negociacao','fechado','perdido','renovacao') NOT NULL DEFAULT 'novo',
	`observations` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;