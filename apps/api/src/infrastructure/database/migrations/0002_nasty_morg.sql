ALTER TABLE "jobs" DROP CONSTRAINT "jobs_customer_id_customers_id_fk";
--> statement-breakpoint
DROP INDEX "customers_company_name_idx";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "customer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_name_idx" ON "customers" USING btree ("name");--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "customer_phone";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "address";