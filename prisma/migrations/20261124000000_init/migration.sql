-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'teacher', 'student');

-- CreateEnum
CREATE TYPE "TokenPurpose" AS ENUM ('set_password', 'reset_password', 'verify_email');

-- CreateEnum
CREATE TYPE "CourseMode" AS ENUM ('online', 'physical');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'rejected', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "OrderEventType" AS ENUM ('placed', 'receipt_uploaded', 'confirmed', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('scheduled', 'live', 'ended');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('queued', 'sent', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT,
    "email_verified_at" TIMESTAMPTZ,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "user_id" UUID NOT NULL,
    "promo_code" TEXT NOT NULL,
    "commission_pct" DECIMAL(5,2) NOT NULL,
    "discount_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "purpose" "TokenPurpose" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "window_ends_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "parent_id" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "instructor_id" UUID NOT NULL,
    "mode" "CourseMode" NOT NULL DEFAULT 'online',
    "venue" TEXT NOT NULL DEFAULT 'Live on Zoom',
    "starts_at" TIMESTAMPTZ NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "outcomes" TEXT[],
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "enrolment_open" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo_public_id" TEXT,
    "instructions" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_fields" (
    "id" UUID NOT NULL,
    "payment_method_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "copyable" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "payment_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "course_id" UUID NOT NULL,
    "student_id" UUID,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "phone_key" TEXT NOT NULL,
    "teacher_id" UUID,
    "promo_code" TEXT,
    "price_base" INTEGER NOT NULL,
    "discount_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "payment_method_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "confirmed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "public_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "transaction_ref" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_events" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "type" "OrderEventType" NOT NULL,
    "note" TEXT,
    "actor_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "order_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "pct" DECIMAL(5,2) NOT NULL,
    "amount" INTEGER NOT NULL,
    "payout_id" UUID,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "created_by_id" UUID NOT NULL,
    "paid_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "zoom_id" TEXT NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'scheduled',
    "started_at" TIMESTAMPTZ,
    "ended_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrants" (
    "id" UUID NOT NULL,
    "meeting_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "join_token" TEXT NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL,
    "registrant_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMPTZ,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "join_refusals" (
    "id" UUID NOT NULL,
    "meeting_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "join_refusals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "order_id" UUID NOT NULL,
    "student_name" TEXT NOT NULL,
    "course_title" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_messages" (
    "id" UUID NOT NULL,
    "template" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "entity_id" TEXT,
    "sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_entries" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "is_placeholder" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_steps" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_stats" (
    "id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "site_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_promo_code_key" ON "teacher_profiles"("promo_code");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_hash_key" ON "auth_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "auth_tokens_user_id_purpose_idx" ON "auth_tokens"("user_id", "purpose");

-- CreateIndex
CREATE INDEX "rate_limits_window_ends_at_idx" ON "rate_limits"("window_ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_position_idx" ON "categories"("parent_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_status_starts_at_idx" ON "courses"("status", "starts_at");

-- CreateIndex
CREATE INDEX "courses_category_id_idx" ON "courses"("category_id");

-- CreateIndex
CREATE INDEX "courses_instructor_id_idx" ON "courses"("instructor_id");

-- CreateIndex
CREATE INDEX "payment_fields_payment_method_id_position_idx" ON "payment_fields"("payment_method_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE INDEX "orders_status_updated_at_idx" ON "orders"("status", "updated_at");

-- CreateIndex
CREATE INDEX "orders_course_id_status_idx" ON "orders"("course_id", "status");

-- CreateIndex
CREATE INDEX "orders_student_id_idx" ON "orders"("student_id");

-- CreateIndex
CREATE INDEX "orders_teacher_id_idx" ON "orders"("teacher_id");

-- CreateIndex
CREATE INDEX "orders_contact_email_idx" ON "orders"("contact_email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_one_active_per_email" ON "orders"("course_id", "contact_email") WHERE (status <> 'cancelled');

-- CreateIndex
CREATE UNIQUE INDEX "receipts_public_id_key" ON "receipts"("public_id");

-- CreateIndex
CREATE INDEX "receipts_order_id_created_at_idx" ON "receipts"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "receipts_transaction_ref_idx" ON "receipts"("transaction_ref");

-- CreateIndex
CREATE INDEX "order_events_order_id_created_at_idx" ON "order_events"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "commissions_teacher_id_payout_id_idx" ON "commissions"("teacher_id", "payout_id");

-- CreateIndex
CREATE INDEX "commissions_payout_id_idx" ON "commissions"("payout_id");

-- CreateIndex
CREATE INDEX "payouts_teacher_id_paid_at_idx" ON "payouts"("teacher_id", "paid_at");

-- CreateIndex
CREATE INDEX "payouts_created_by_id_idx" ON "payouts"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_course_id_key" ON "meetings"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_zoom_id_key" ON "meetings"("zoom_id");

-- CreateIndex
CREATE UNIQUE INDEX "registrants_join_token_key" ON "registrants"("join_token");

-- CreateIndex
CREATE INDEX "registrants_order_id_idx" ON "registrants"("order_id");

-- CreateIndex
CREATE INDEX "registrants_meeting_id_idx" ON "registrants"("meeting_id");

-- CreateIndex
CREATE UNIQUE INDEX "registrants_one_active_per_email" ON "registrants"("meeting_id", "email") WHERE (revoked_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "registrants_one_active_per_order" ON "registrants"("order_id") WHERE (revoked_at IS NULL);

-- CreateIndex
CREATE INDEX "attendance_registrant_id_idx" ON "attendance"("registrant_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_one_open" ON "attendance"("registrant_id") WHERE (left_at IS NULL);

-- CreateIndex
CREATE INDEX "join_refusals_meeting_id_created_at_idx" ON "join_refusals"("meeting_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_code_key" ON "certificates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_order_id_key" ON "certificates"("order_id");

-- CreateIndex
CREATE INDEX "email_messages_status_created_at_idx" ON "email_messages"("status", "created_at");

-- CreateIndex
CREATE INDEX "audit_entries_entity_entity_id_idx" ON "audit_entries"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_entries_actor_id_idx" ON "audit_entries"("actor_id");

-- CreateIndex
CREATE INDEX "audit_entries_created_at_idx" ON "audit_entries"("created_at");

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_fields" ADD CONSTRAINT "payment_fields_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "payouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "registrants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_refusals" ADD CONSTRAINT "join_refusals_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_entries" ADD CONSTRAINT "audit_entries_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
