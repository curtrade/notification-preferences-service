-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'MESSENGER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRANSACTIONAL', 'MARKETING');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('EU', 'US', 'APAC', 'OTHER');

-- CreateEnum
CREATE TYPE "PolicyEffect" AS ENUM ('DENY');

-- CreateTable
CREATE TABLE "notification_default" (
    "id" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "channel" "Channel" NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "notification_default_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preference" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "channel" "Channel" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quiet_hours" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_quiet_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_policy" (
    "id" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "channel" "Channel" NOT NULL,
    "region" "Region" NOT NULL,
    "effect" "PolicyEffect" NOT NULL DEFAULT 'DENY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_default_notification_type_channel_key" ON "notification_default"("notification_type", "channel");

-- CreateIndex
CREATE INDEX "user_preference_user_id_idx" ON "user_preference"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preference_user_id_notification_type_channel_key" ON "user_preference"("user_id", "notification_type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "user_quiet_hours_user_id_key" ON "user_quiet_hours"("user_id");

-- CreateIndex
CREATE INDEX "global_policy_notification_type_channel_region_idx" ON "global_policy"("notification_type", "channel", "region");

-- CreateIndex
CREATE UNIQUE INDEX "global_policy_notification_type_channel_region_key" ON "global_policy"("notification_type", "channel", "region");
