import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  isActive: boolean("is_active").default(true),
  quota: integer("quota").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  status: varchar("status").default("pending"), // pending, approved, rejected
  category: varchar("category").notNull(), // PKS, Juknis, POC
  expirationDate: timestamp("expiration_date"),
  isActive: boolean("is_active").default(true),
  version: varchar("version").default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table for managing PKS, Juknis, POC agreements
export const agreements = pgTable("agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  documentId: varchar("document_id").references(() => documents.id),
  type: varchar("type").notNull(), // PKS, Juknis, POC
  agreementNumber: varchar("agreement_number"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").default("active"), // active, expired, pending_renewal
  renewalRequested: boolean("renewal_requested").default(false),
  renewalRequestDate: timestamp("renewal_request_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table for quota monitoring and PNBP transactions
export const quotaUsage = pgTable("quota_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  quotaType: varchar("quota_type").notNull(), // access, download, api_calls
  usedAmount: integer("used_amount").default(0),
  totalQuota: integer("total_quota").notNull(),
  period: varchar("period").default("monthly"), // daily, monthly, yearly
  resetDate: timestamp("reset_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table for PNBP transactions
export const pnbpTransactions = pgTable("pnbp_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  transactionId: varchar("transaction_id").unique(),
  amount: integer("amount").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"), // pending, completed, failed
  paymentMethod: varchar("payment_method"),
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // login, upload, download, request, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // extension, quota_reset, access
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: varchar("status").default("pending"), // pending, approved, rejected
  priority: varchar("priority").default("normal"), // normal, urgent
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").default("info"), // info, warning, success, error
  targetType: varchar("target_type").default("all"), // all, user, role
  targetId: varchar("target_id"),
  sentBy: varchar("sent_by").references(() => users.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAgreementSchema = createInsertSchema(agreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuotaUsageSchema = createInsertSchema(quotaUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPnbpTransactionSchema = createInsertSchema(pnbpTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertAgreement = z.infer<typeof insertAgreementSchema>;
export type Agreement = typeof agreements.$inferSelect;
export type InsertQuotaUsage = z.infer<typeof insertQuotaUsageSchema>;
export type QuotaUsage = typeof quotaUsage.$inferSelect;
export type InsertPnbpTransaction = z.infer<typeof insertPnbpTransactionSchema>;
export type PnbpTransaction = typeof pnbpTransactions.$inferSelect;
