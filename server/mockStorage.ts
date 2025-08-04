import {
  users,
  documents,
  activities,
  requests,
  notifications,
  agreements,
  quotaUsage,
  pnbpTransactions,
  type User,
  type UpsertUser,
  type Document,
  type InsertDocument,
  type Activity,
  type InsertActivity,
  type Request,
  type InsertRequest,
  type Notification,
  type InsertNotification,
  type Agreement,
  type InsertAgreement,
  type QuotaUsage,
  type InsertQuotaUsage,
  type PnbpTransaction,
  type InsertPnbpTransaction,
} from "../shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Document operations
  createDocument(doc: InsertDocument): Promise<Document>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(limit?: number): Promise<Activity[]>;
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  
  // Request operations
  createRequest(request: InsertRequest): Promise<Request>;
  getAllRequests(): Promise<Request[]>;
  getPendingRequests(): Promise<Request[]>;
  updateRequest(id: string, updates: Partial<Request>): Promise<Request | undefined>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<boolean>;
  
  // Agreement operations (PKS, Juknis, POC)
  createAgreement(agreement: InsertAgreement): Promise<Agreement>;
  getUserAgreements(userId: string): Promise<Agreement[]>;
  getExpiringAgreements(daysAhead?: number): Promise<Agreement[]>;
  updateAgreement(id: string, updates: Partial<Agreement>): Promise<Agreement | undefined>;
  requestAgreementRenewal(agreementId: string): Promise<boolean>;
  
  // Quota management
  createQuotaUsage(quota: InsertQuotaUsage): Promise<QuotaUsage>;
  getUserQuotaUsage(userId: string): Promise<QuotaUsage[]>;
  updateQuotaUsage(userId: string, quotaType: string, amount: number): Promise<boolean>;
  resetUserQuota(userId: string, quotaType: string): Promise<boolean>;
  
  // PNBP transaction management
  createPnbpTransaction(transaction: InsertPnbpTransaction): Promise<PnbpTransaction>;
  getUserTransactions(userId: string): Promise<PnbpTransaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<boolean>;
  
  // Statistics with PKS/Juknis/POC support
  getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    todayLogins: number;
    pendingDocs: number;
    pendingRequests: number;
    activeAgreements: number;
    expiringAgreements: number;
    totalQuotaUsage: number;
    pendingTransactions: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private documents: Map<string, Document> = new Map();
  private activities: Map<string, Activity> = new Map();
  private requests: Map<string, Request> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private agreements: Map<string, Agreement> = new Map();
  private quotaUsage: Map<string, QuotaUsage> = new Map();
  private transactions: Map<string, PnbpTransaction> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: "admin-123",
      email: "admin@datakependudukan.gov.id",
      firstName: "Admin",
      lastName: "Pratama",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      role: "admin",
      isActive: true,
      quota: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample users
    const sampleUsers: User[] = [
      {
        id: "user-001",
        email: "budi.santoso@example.com",
        firstName: "Budi",
        lastName: "Santoso",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        role: "user",
        isActive: true,
        quota: 100,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "user-002",
        email: "siti.rahma@example.com",
        firstName: "Siti",
        lastName: "Rahma",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        role: "user",
        isActive: true,
        quota: 100,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

    // Add sample documents
    const sampleDocuments: Document[] = [
      {
        id: "doc-001",
        title: "Perjanjian Kerja Sama (PKS) Tahun 2024",
        description: "Perjanjian kerja sama antara Dinas Kependudukan dan Catatan Sipil",
        fileName: "pks-2024-signed.pdf",
        filePath: "/uploads/pks-2024-signed.pdf",
        fileSize: 2048576,
        mimeType: "application/pdf",
        uploadedBy: "admin-123",
        status: "approved",
        category: "PKS",
        expirationDate: new Date("2024-12-31"),
        isActive: true,
        version: "1.0",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "doc-002",
        title: "Petunjuk Teknis (Juknis) Akta Kelahiran",
        description: "Petunjuk teknis pengurusan akta kelahiran untuk warga baru",
        fileName: "juknis-akta-kelahiran.pdf",
        filePath: "/uploads/juknis-akta-kelahiran.pdf",
        fileSize: 1024000,
        mimeType: "application/pdf",
        uploadedBy: "user-001",
        status: "pending",
        category: "Juknis",
        expirationDate: new Date("2025-06-30"),
        isActive: true,
        version: "2.1",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    sampleDocuments.forEach(doc => this.documents.set(doc.id, doc));

    // Add sample activities
    const today = new Date();
    const sampleActivities: Activity[] = [
      {
        id: randomUUID(),
        userId: "user-001",
        type: "login",
        description: "Budi Santoso berhasil login",
        metadata: { ip: "192.168.1.1" },
        createdAt: new Date(today.getTime() - 2 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: "user-002",
        type: "upload",
        description: "Siti Rahma upload dokumen PKS",
        metadata: { fileName: "dokumen-pks-2025.pdf" },
        createdAt: new Date(today.getTime() - 15 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: "user-001",
        type: "download",
        description: "Budi Santosa download juknis akta kelahiran",
        metadata: { documentId: "doc-002" },
        createdAt: new Date(today.getTime() - 60 * 60 * 1000),
      },
    ];

    sampleActivities.forEach(activity => this.activities.set(activity.id, activity));

    // Add sample requests
    const sampleRequests: Request[] = [
      {
        id: randomUUID(),
        userId: "user-001",
        type: "extension",
        title: "Perpanjangan Akses Database",
        description: "Memerlukan perpanjangan akses untuk menyelesaikan laporan bulanan divisi kependudukan.",
        status: "pending" as const,
        priority: "normal" as const,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: "user-002",
        type: "quota_reset",
        title: "Reset Kuota Download",
        description: "Kuota download dokumen sudah habis, memerlukan reset untuk keperluan audit internal.",
        status: "pending" as const,
        priority: "urgent" as const,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date(today.getTime() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 4 * 60 * 60 * 1000),
      },
    ];

    sampleRequests.forEach(request => this.requests.set(request.id, request));

    // Add sample agreements
    const sampleAgreements: Agreement[] = [
      {
        id: "agr-001",
        userId: "user-001",
        documentId: "doc-001",
        type: "PKS",
        agreementNumber: "PKS/2024/001",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        status: "active" as const,
        renewalRequested: false,
        renewalRequestDate: null,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "agr-002",
        userId: "user-002",
        documentId: "doc-002",
        type: "Juknis",
        agreementNumber: "JUK/2024/002",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2025-05-31"),
        status: "active" as const,
        renewalRequested: false,
        renewalRequestDate: null,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "agr-003",
        userId: "admin-123",
        documentId: "doc-001",
        type: "POC",
        agreementNumber: "POC/2024/003",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-11-30"),
        status: "pending_renewal" as const,
        renewalRequested: true,
        renewalRequestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "agr-004",
        userId: "user-001",
        documentId: "doc-002",
        type: "PKS",
        agreementNumber: "PKS/2023/004",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        status: "expired" as const,
        renewalRequested: false,
        renewalRequestDate: null,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    sampleAgreements.forEach(agreement => this.agreements.set(agreement.id, agreement));

    // Add sample quota usage
    const sampleQuotaUsage: QuotaUsage[] = [
      {
        id: "quota-001",
        userId: "user-001",
        quotaType: "document_download",
        totalQuota: 100,
        usedQuota: 75,
        remainingQuota: 25,
        resetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "quota-002",
        userId: "user-002",
        quotaType: "document_download",
        totalQuota: 100,
        usedQuota: 45,
        remainingQuota: 55,
        resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "quota-003",
        userId: "admin-123",
        quotaType: "document_download",
        totalQuota: 1000,
        usedQuota: 350,
        remainingQuota: 650,
        resetDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "quota-004",
        userId: "user-001",
        quotaType: "api_calls",
        totalQuota: 500,
        usedQuota: 480,
        remainingQuota: 20,
        resetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    sampleQuotaUsage.forEach(quota => this.quotaUsage.set(quota.id, quota));

    // Add sample PNBP transactions
    const sampleTransactions: PnbpTransaction[] = [
      {
        id: "pnbp-001",
        userId: "user-001",
        transactionId: "TRX/2024/001",
        serviceType: "akta_kelahiran",
        amount: 50000,
        status: "completed" as const,
        paymentMethod: "bank_transfer",
        paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        referenceNumber: "REF-2024-001-ABC",
        notes: "Pembayaran untuk akta kelahiran anak pertama",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "pnbp-002",
        userId: "user-002",
        transactionId: "TRX/2024/002",
        serviceType: "akta_kematian",
        amount: 75000,
        status: "pending" as const,
        paymentMethod: "virtual_account",
        paymentDate: null,
        referenceNumber: "REF-2024-002-DEF",
        notes: "Pembayaran untuk akta kematian",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "pnbp-003",
        userId: "admin-123",
        transactionId: "TRX/2024/003",
        serviceType: "ktp_baru",
        amount: 100000,
        status: "completed" as const,
        paymentMethod: "e_wallet",
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        referenceNumber: "REF-2024-003-GHI",
        notes: "Pembayaran untuk pembuatan KTP baru",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "pnbp-004",
        userId: "user-001",
        transactionId: "TRX/2024/004",
        serviceType: "kk_baru",
        amount: 25000,
        status: "failed" as const,
        paymentMethod: "bank_transfer",
        paymentDate: null,
        referenceNumber: "REF-2024-004-JKL",
        notes: "Pembayaran gagal untuk kartu keluarga baru",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    sampleTransactions.forEach(transaction => this.transactions.set(transaction.id, transaction));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = Array.from(this.users.values()).find(u => u.id === userData.id);
    
    if (existing) {
      const updated: User = {
        ...existing,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(existing.id, updated);
      return updated;
    } else {
      const id = userData.id || randomUUID();
      const user: User = {
        id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || "user",
        isActive: userData.isActive ?? true,
        quota: userData.quota || 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(id, user);
      return user;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  // Document operations
  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      id,
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;

    const updated: Document = {
      ...doc,
      ...updates,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const newActivity: Activity = {
      id,
      ...activity,
      createdAt: new Date(),
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getUserActivities(userId: string, limit = 50): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    return activities
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Request operations
  async createRequest(request: InsertRequest): Promise<Request> {
    const id = randomUUID();
    const newRequest: Request = {
      id,
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.requests.set(id, newRequest);
    return newRequest;
  }

  async getAllRequests(): Promise<Request[]> {
    return Array.from(this.requests.values());
  }

  async getPendingRequests(): Promise<Request[]> {
    return Array.from(this.requests.values()).filter(r => r.status === "pending");
  }

  async updateRequest(id: string, updates: Partial<Request>): Promise<Request | undefined> {
    const request = this.requests.get(id);
    if (!request) return undefined;

    const updated: Request = {
      ...request,
      ...updates,
      updatedAt: new Date(),
    };
    this.requests.set(id, updated);
    return updated;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      id,
      ...notification,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = Array.from(this.notifications.values());
    return notifications
      .filter(n => n.targetType === "all" || (n.targetType === "user" && n.targetId === userId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;

    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Agreement operations
  async createAgreement(agreement: InsertAgreement): Promise<Agreement> {
    const id = randomUUID();
    const newAgreement: Agreement = {
      id,
      ...agreement,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.agreements.set(id, newAgreement);
    return newAgreement;
  }

  async getUserAgreements(userId: string): Promise<Agreement[]> {
    return Array.from(this.agreements.values()).filter(a => a.userId === userId);
  }

  async getExpiringAgreements(daysAhead = 30): Promise<Agreement[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return Array.from(this.agreements.values()).filter(agreement => 
      agreement.endDate && agreement.endDate <= futureDate && agreement.status === "active"
    );
  }

  async updateAgreement(id: string, updates: Partial<Agreement>): Promise<Agreement | undefined> {
    const agreement = this.agreements.get(id);
    if (!agreement) return undefined;

    const updated: Agreement = {
      ...agreement,
      ...updates,
      updatedAt: new Date(),
    };
    this.agreements.set(id, updated);
    return updated;
  }

  async requestAgreementRenewal(agreementId: string): Promise<boolean> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) return false;

    agreement.renewalRequested = true;
    agreement.renewalRequestDate = new Date();
    this.agreements.set(agreementId, agreement);
    return true;
  }

  async getUserAgreements(userId: string): Promise<Agreement[]> {
    return Array.from(this.agreements.values()).filter(a => a.userId === userId);
  }

  async getExpiringAgreements(daysAhead = 30): Promise<Agreement[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return Array.from(this.agreements.values()).filter(agreement => 
      agreement.endDate && agreement.endDate <= futureDate && agreement.status === "active"
    );
  }

  // Quota management
  async createQuotaUsage(quota: InsertQuotaUsage): Promise<QuotaUsage> {
    const id = randomUUID();
    const newQuota: QuotaUsage = {
      id,
      ...quota,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quotaUsage.set(id, newQuota);
    return newQuota;
  }

  async getUserQuotaUsage(userId: string): Promise<QuotaUsage[]> {
    return Array.from(this.quotaUsage.values()).filter(q => q.userId === userId);
  }

  async resetUserQuota(userId: string, quotaType: string): Promise<boolean> {
    const quota = Array.from(this.quotaUsage.values()).find(
      q => q.userId === userId && q.quotaType === quotaType
    );
    
    if (quota) {
      quota.usedQuota = 0;
      quota.updatedAt = new Date();
      this.quotaUsage.set(quota.id, quota);
      return true;
    }
    return false;
  }

  // PNBP transaction management
  async createPnbpTransaction(transaction: InsertPnbpTransaction): Promise<PnbpTransaction> {
    const id = randomUUID();
    const newTransaction: PnbpTransaction = {
      id,
      ...transaction,
      createdAt: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<PnbpTransaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }

  async updateTransactionStatus(id: string, status: string): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (!transaction) return false;

    transaction.status = status as any;
    this.transactions.set(id, transaction);
    return true;
  }

  async getUserQuotaUsage(userId: string): Promise<QuotaUsage[]> {
    return Array.from(this.quotaUsage.values()).filter(q => q.userId === userId);
  }

  async updateQuotaUsage(userId: string, quotaType: string, amount: number): Promise<boolean> {
    const quota = Array.from(this.quotaUsage.values()).find(
      q => q.userId === userId && q.quotaType === quotaType
    );
    
    if (quota) {
      quota.usedAmount += amount;
      quota.updatedAt = new Date();
      this.quotaUsage.set(quota.id, quota);
      return true;
    }
    return false;
  }

  async resetUserQuota(userId: string, quotaType: string): Promise<boolean> {
    const quota = Array.from(this.quotaUsage.values()).find(
      q => q.userId === userId && q.quotaType === quotaType
    );
    
    if (quota) {
      quota.usedAmount = 0;
      quota.updatedAt = new Date();
      this.quotaUsage.set(quota.id, quota);
      return true;
    }
    return false;
  }

  // PNBP transaction management
  async createPnbpTransaction(transaction: InsertPnbpTransaction): Promise<PnbpTransaction> {
    const id = randomUUID();
    const newTransaction: PnbpTransaction = {
      id,
      ...transaction,
      createdAt: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<PnbpTransaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }

  async updateTransactionStatus(id: string, status: string): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (!transaction) return false;

    transaction.status = status as any;
    this.transactions.set(id, transaction);
    return true;
  }

  // Statistics
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    todayLogins: number;
    pendingDocs: number;
    pendingRequests: number;
    activeAgreements: number;
    expiringAgreements: number;
    totalQuotaUsage: number;
    pendingTransactions: number;
  }> {
    const totalUsers = this.users.size;
    const activeUsers = Array.from(this.users.values()).filter(u => u.isActive).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogins = Array.from(this.activities.values()).filter(
      a => a.type === "login" && a.createdAt >= today
    ).length;
    
    const pendingDocs = Array.from(this.documents.values()).filter(d => d.status === "pending").length;
    const pendingRequests = Array.from(this.requests.values()).filter(r => r.status === "pending").length;
    const activeAgreements = Array.from(this.agreements.values()).filter(a => a.status === "active").length;
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringAgreements = Array.from(this.agreements.values()).filter(agreement => 
      agreement.endDate && agreement.endDate <= futureDate && agreement.status === "active"
    ).length;

    const totalQuotaUsage = Array.from(this.quotaUsage.values()).reduce((sum, q) => sum + q.usedAmount, 0);
    const pendingTransactions = Array.from(this.transactions.values()).filter(t => t.status === "pending").length;

    return {
      totalUsers,
      activeUsers,
      todayLogins,
      pendingDocs,
      pendingRequests,
      activeAgreements,
      expiringAgreements,
      totalQuotaUsage,
      pendingTransactions,
    };
  }
}

export const storage = new MemStorage();