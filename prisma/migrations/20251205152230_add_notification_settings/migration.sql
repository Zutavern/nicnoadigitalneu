-- AlterTable
ALTER TABLE "salon_profiles" ADD COLUMN     "booking_reminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sms_notifications" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "stylist_profiles" ADD COLUMN     "booking_reminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cancellation_alert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "email_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "instagram_url" TEXT,
ADD COLUMN     "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "new_booking_alert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "review_alert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sms_notifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "tiktok_url" TEXT,
ADD COLUMN     "website_url" TEXT,
ADD COLUMN     "zip_code" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;
