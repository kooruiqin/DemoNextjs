CREATE TABLE "food_options" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"meal_type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spin_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"meal_type" text NOT NULL,
	"option_id" text,
	"option_name" text NOT NULL,
	"accepted" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_options" ADD CONSTRAINT "food_options_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spin_records" ADD CONSTRAINT "spin_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spin_records" ADD CONSTRAINT "spin_records_option_id_food_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."food_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "food_options_user_idx" ON "food_options" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spin_records_user_created_idx" ON "spin_records" USING btree ("user_id","created_at");