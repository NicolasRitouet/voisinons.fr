ALTER TABLE "parties" ADD COLUMN "last_reminder_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "parties" ADD COLUMN "reminder_opt_out" boolean DEFAULT false NOT NULL;