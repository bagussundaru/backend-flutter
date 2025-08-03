import {
  users,
  documents,
  activities,
  requests,
  notifications,
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
} from "@shared/schema";
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
  
  // Statistics
  getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    todayLogins: number;
    pendingDocs: number;
    pendingRequests: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private documents: Map<string, Document> = new Map();
  private activities: Map<string, Activity> = new Map();
  private requests: Map<string, Request> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    // Initialize with some sample data for the admin user
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

    // Add some sample activities
    const today = new Date();
    const activities = [
      {
        id: randomUUID(),
        userId: "user-1",
        type: "login",
        description: "Budi Santoso berhasil login",
        metadata: { ip: "192.168.1.1" },
        createdAt: new Date(today.getTime() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: randomUUID(),
        userId: "user-2",
        type: "upload",
        description: "Siti Rahma upload dokumen PKS",
        metadata: { fileName: "dokumen-pks-2025.pdf" },
        createdAt: new Date(today.getTime() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        id: randomUUID(),
        userId: "user-3",
        type: "request",
        description: "Ahmad Wijaya request perpanjangan",
        metadata: { requestType: "extension" },
        createdAt: new Date(today.getTime() - 60 * 60 * 1000), // 1 hour ago
      },
    ];

    activities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });

    // Add some sample requests
    const requests = [
      {
        id: randomUUID(),
        userId: "user-4",
        type: "extension",
        title: "Perpanjangan Akses",
        description: "Memerlukan perpanjangan akses untuk menyelesaikan laporan bulanan divisi kependudukan.",
        status: "pending" as const,
        priority: "normal" as const,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: "user-5",
        type: "quota_reset",
        title: "Reset Kuota",
        description: "Kuota download dokumen sudah habis, memerlukan reset untuk keperluan audit internal.",
        status: "pending" as const,
        priority: "urgent" as const,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date(today.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(today.getTime() - 4 * 60 * 60 * 1000),
      },
    ];

    requests.forEach(request => {
      this.requests.set(request.id, request);
    });
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

  // Statistics
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    todayLogins: number;
    pendingDocs: number;
    pendingRequests: number;
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

    return {
      totalUsers,
      activeUsers,
      todayLogins,
      pendingDocs,
      pendingRequests,
    };
  }
}

export const storage = new MemStorage();
