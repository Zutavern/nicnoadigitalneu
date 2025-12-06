-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CHAIR_RENTAL', 'BOOKING', 'SUBSCRIPTION', 'DEPOSIT', 'OTHER');

-- CreateTable
CREATE TABLE "salons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "street" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "zip_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'Deutschland',
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "website" TEXT,
    "opening_hours" JSONB,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chair_count" INTEGER NOT NULL DEFAULT 0,
    "salon_size" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "salons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chairs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "daily_rate" DECIMAL(10,2),
    "weekly_rate" DECIMAL(10,2),
    "monthly_rate" DECIMAL(10,2),
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "chairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chair_rentals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chair_id" UUID NOT NULL,
    "stylist_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "monthly_rent" DECIMAL(10,2) NOT NULL,
    "deposit" DECIMAL(10,2),
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDING',
    "contract_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "chair_rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stylist_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stylist_id" UUID NOT NULL,
    "customer_id" UUID,
    "service_id" UUID,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "price" DECIMAL(10,2),
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID,
    "stylist_id" UUID,
    "reviewer_id" UUID,
    "reviewer_name" VARCHAR(100),
    "reviewer_email" VARCHAR(255),
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payer_id" UUID NOT NULL,
    "receiver_id" UUID,
    "rental_id" UUID,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "description" VARCHAR(500),
    "period_start" DATE,
    "period_end" DATE,
    "due_date" DATE,
    "paid_at" TIMESTAMPTZ,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_intent_id" TEXT,
    "invoice_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salons_slug_key" ON "salons"("slug");

-- CreateIndex
CREATE INDEX "salons_owner_id_idx" ON "salons"("owner_id");

-- CreateIndex
CREATE INDEX "salons_city_idx" ON "salons"("city");

-- CreateIndex
CREATE INDEX "salons_is_active_is_verified_idx" ON "salons"("is_active", "is_verified");

-- CreateIndex
CREATE INDEX "chairs_salon_id_idx" ON "chairs"("salon_id");

-- CreateIndex
CREATE INDEX "chairs_is_available_is_active_idx" ON "chairs"("is_available", "is_active");

-- CreateIndex
CREATE INDEX "chair_rentals_stylist_id_idx" ON "chair_rentals"("stylist_id");

-- CreateIndex
CREATE INDEX "chair_rentals_status_idx" ON "chair_rentals"("status");

-- CreateIndex
CREATE INDEX "chair_rentals_start_date_end_date_idx" ON "chair_rentals"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "customers_stylist_id_idx" ON "customers"("stylist_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_stylist_id_email_key" ON "customers"("stylist_id", "email");

-- CreateIndex
CREATE INDEX "bookings_stylist_id_idx" ON "bookings"("stylist_id");

-- CreateIndex
CREATE INDEX "bookings_customer_id_idx" ON "bookings"("customer_id");

-- CreateIndex
CREATE INDEX "bookings_start_time_end_time_idx" ON "bookings"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "reviews_salon_id_idx" ON "reviews"("salon_id");

-- CreateIndex
CREATE INDEX "reviews_stylist_id_idx" ON "reviews"("stylist_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "payments_payer_id_idx" ON "payments"("payer_id");

-- CreateIndex
CREATE INDEX "payments_receiver_id_idx" ON "payments"("receiver_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_type_idx" ON "payments"("type");

-- CreateIndex
CREATE INDEX "payments_due_date_idx" ON "payments"("due_date");

-- AddForeignKey
ALTER TABLE "salons" ADD CONSTRAINT "salons_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chairs" ADD CONSTRAINT "chairs_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chair_rentals" ADD CONSTRAINT "chair_rentals_chair_id_fkey" FOREIGN KEY ("chair_id") REFERENCES "chairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "chair_rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
