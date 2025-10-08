-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

