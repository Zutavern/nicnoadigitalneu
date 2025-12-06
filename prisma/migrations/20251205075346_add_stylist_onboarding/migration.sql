-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SALON_OWNER', 'STYLIST');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'UPLOADED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('IN_PROGRESS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMPTZ,
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STYLIST',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_subscription_status" TEXT,
    "stripe_price_id" TEXT,
    "stripe_current_period_end" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "phone" TEXT,
    "street" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "country" TEXT DEFAULT 'Deutschland',
    "bio" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salon_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "salon_name" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "country" TEXT DEFAULT 'Deutschland',
    "phone" TEXT,
    "website" TEXT,
    "employee_count" INTEGER,
    "chair_count" INTEGER,
    "salon_size" INTEGER,
    "description" TEXT,
    "opening_hours" JSONB,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "salon_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stylist_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "years_experience" INTEGER,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "portfolio" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hourly_rate" DECIMAL(10,2),
    "availability" JSONB,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stylist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stylist_onboardings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "company_name" TEXT,
    "tax_id" TEXT,
    "vat_id" TEXT,
    "business_street" TEXT,
    "business_city" TEXT,
    "business_zip_code" TEXT,
    "own_phone" BOOLEAN NOT NULL DEFAULT false,
    "own_appointment_book" BOOLEAN NOT NULL DEFAULT false,
    "own_cash_register" BOOLEAN NOT NULL DEFAULT false,
    "own_price_list" BOOLEAN NOT NULL DEFAULT false,
    "own_branding" BOOLEAN NOT NULL DEFAULT false,
    "compliance_confirmed_at" TIMESTAMPTZ,
    "master_certificate_url" TEXT,
    "master_certificate_status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "business_registration_url" TEXT,
    "business_registration_status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "liability_insurance_url" TEXT,
    "liability_insurance_status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "status_determination_url" TEXT,
    "status_determination_status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "crafts_chamber_url" TEXT,
    "crafts_chamber_status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "self_employment_declaration" BOOLEAN NOT NULL DEFAULT false,
    "declaration_signed_at" TIMESTAMPTZ,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "admin_notes" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stylist_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_incidents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,
    "impact" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "status_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "value" DECIMAL NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_status" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "system_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "description" TEXT,

    CONSTRAINT "test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "salon_profiles_user_id_key" ON "salon_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stylist_profiles_user_id_key" ON "stylist_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stylist_onboardings_user_id_key" ON "stylist_onboardings"("user_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salon_profiles" ADD CONSTRAINT "salon_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stylist_profiles" ADD CONSTRAINT "stylist_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stylist_onboardings" ADD CONSTRAINT "stylist_onboardings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
