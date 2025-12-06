-- CreateEnum
CREATE TYPE "SecurityEventStatus" AS ENUM ('SUCCESS', 'FAILED', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGED', 'PASSWORD_RESET', 'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'SESSION_TERMINATED', 'PERMISSION_CHANGED', 'SETTINGS_CHANGED', 'USER_CREATED', 'USER_DELETED', 'SUSPICIOUS_ACTIVITY');

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "company_name" VARCHAR(200) NOT NULL DEFAULT 'NICNOA & CO.',
    "support_email" VARCHAR(255) NOT NULL DEFAULT 'support@nicnoa.de',
    "support_phone" VARCHAR(50),
    "default_language" VARCHAR(10) NOT NULL DEFAULT 'de',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Europe/Berlin',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "primary_color" VARCHAR(20) DEFAULT '#3B82F6',
    "trial_days" INTEGER NOT NULL DEFAULT 14,
    "smtp_host" VARCHAR(255),
    "smtp_port" INTEGER,
    "smtp_user" VARCHAR(255),
    "smtp_password" VARCHAR(500),
    "smtp_from" VARCHAR(255),
    "smtp_secure" BOOLEAN NOT NULL DEFAULT true,
    "google_analytics_id" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "user_email" VARCHAR(255) NOT NULL,
    "event" "SecurityEventType" NOT NULL,
    "status" "SecurityEventStatus" NOT NULL DEFAULT 'SUCCESS',
    "message" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "location" VARCHAR(255),
    "device" VARCHAR(100),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "key" TEXT NOT NULL,
    "key_prefix" VARCHAR(10) NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_test_mode" BOOLEAN NOT NULL DEFAULT false,
    "last_used_at" TIMESTAMPTZ,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "device" VARCHAR(100),
    "browser" VARCHAR(100),
    "os" VARCHAR(100),
    "location" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_logs_user_id_idx" ON "security_logs"("user_id");

-- CreateIndex
CREATE INDEX "security_logs_event_idx" ON "security_logs"("event");

-- CreateIndex
CREATE INDEX "security_logs_status_idx" ON "security_logs"("status");

-- CreateIndex
CREATE INDEX "security_logs_created_at_idx" ON "security_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_is_active_idx" ON "api_keys"("is_active");

-- CreateIndex
CREATE INDEX "api_keys_created_by_id_idx" ON "api_keys"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "active_sessions_session_token_key" ON "active_sessions"("session_token");

-- CreateIndex
CREATE INDEX "active_sessions_user_id_idx" ON "active_sessions"("user_id");

-- CreateIndex
CREATE INDEX "active_sessions_is_active_idx" ON "active_sessions"("is_active");

-- CreateIndex
CREATE INDEX "active_sessions_last_active_at_idx" ON "active_sessions"("last_active_at");
