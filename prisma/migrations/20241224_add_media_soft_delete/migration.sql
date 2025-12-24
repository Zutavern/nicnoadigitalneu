-- Add soft delete columns to media_files table
ALTER TABLE "media_files" ADD COLUMN "deleted_at" TIMESTAMPTZ;
ALTER TABLE "media_files" ADD COLUMN "deleted_by" UUID;

-- Add index for soft delete queries
CREATE INDEX "media_files_deleted_at_idx" ON "media_files"("deleted_at");

