CREATE TABLE "food_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "food_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text,
	"name" varchar(255) NOT NULL,
	"calories" numeric(8,2) NOT NULL,
	"carbs" numeric(8,2) DEFAULT '0' NOT NULL,
	"fiber" numeric(8,2),
	"sugar" numeric(8,2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_food_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "meal_food_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"meal_id" integer NOT NULL,
	"food_item_id" integer NOT NULL,
	"quantity" numeric(8,2) DEFAULT '1' NOT NULL,
	CONSTRAINT "meal_food_items_meal_id_food_item_id_unique" UNIQUE("meal_id","food_item_id")
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "meals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" varchar(255),
	"eaten_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users";--> statement-breakpoint
CREATE INDEX "food_items_user_id_index" ON "food_items" ("user_id");--> statement-breakpoint
CREATE INDEX "food_items_name_index" ON "food_items" ("name");--> statement-breakpoint
CREATE INDEX "meal_food_items_meal_id_index" ON "meal_food_items" ("meal_id");--> statement-breakpoint
CREATE INDEX "meals_user_id_eaten_at_index" ON "meals" ("user_id","eaten_at");--> statement-breakpoint
ALTER TABLE "meal_food_items" ADD CONSTRAINT "meal_food_items_meal_id_meals_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meal_food_items" ADD CONSTRAINT "meal_food_items_food_item_id_food_items_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE RESTRICT;