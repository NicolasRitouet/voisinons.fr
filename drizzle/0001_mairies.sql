CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE TABLE "mairies" (
	"code_insee" varchar(5) PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"nom_normalise" varchar(255) NOT NULL,
	"code_postal" varchar(5) NOT NULL,
	"email" varchar(255) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mairies_nom_normalise_idx" ON "mairies" USING btree ("nom_normalise" varchar_pattern_ops);
--> statement-breakpoint
CREATE INDEX "mairies_nom_normalise_trgm_idx" ON "mairies" USING gin ("nom_normalise" gin_trgm_ops);
