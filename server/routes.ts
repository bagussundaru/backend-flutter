import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRequestSchema, insertNotificationSchema, insertDocumentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper to get consistent user ID in both dev and prod
function getUserId(req: any): string {
  if (process.env.NODE_ENV === 'development') {
    return "admin-123";
  }
  return req.user.claims.sub;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const activityData = { ...req.body, userId };
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = getUserId(req);
      const { title, description, category } = req.body;

      const documentData = {
        title,
        description,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: userId,
        category,
        status: 'pending' as const,
      };

      const document = await storage.createDocument(documentData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'upload',
        description: `Uploaded document: ${title}`,
        metadata: { documentId: document.id, fileName: req.file.originalname },
      });

      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.patch('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const document = await storage.updateDocument(id, updates);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Request routes
  app.get('/api/requests', isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getAllRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.get('/api/requests/pending', isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getPendingRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.post('/api/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const requestData = insertRequestSchema.parse({ ...req.body, userId });
      const request = await storage.createRequest(requestData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'request',
        description: `Created request: ${request.title}`,
        metadata: { requestId: request.id, requestType: request.type },
      });

      res.json(request);
    } catch (error) {
      console.error("Error creating request:", error);
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.patch('/api/requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      const updates = req.body;
      
      if (updates.status) {
        updates.reviewedBy = userId;
        updates.reviewedAt = new Date();
      }

      const request = await storage.updateRequest(id, updates);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Log activity
      if (updates.status) {
        await storage.createActivity({
          userId,
          type: 'review',
          description: `${updates.status === 'approved' ? 'Approved' : 'Rejected'} request: ${request.title}`,
          metadata: { requestId: request.id, status: updates.status },
        });
      }

      res.json(request);
    } catch (error) {
      console.error("Error updating request:", error);
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const notificationData = insertNotificationSchema.parse({ ...req.body, sentBy: userId });
      const notification = await storage.createNotification(notificationData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'notification',
        description: `Sent notification: ${notification.title}`,
        metadata: { notificationId: notification.id, targetType: notification.targetType },
      });

      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Agreement routes (PKS, Juknis, POC)
  app.get('/api/agreements', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const agreements = await storage.getUserAgreements(userId);
      res.json(agreements);
    } catch (error) {
      console.error("Error fetching agreements:", error);
      res.status(500).json({ message: "Failed to fetch agreements" });
    }
  });

  app.get('/api/agreements/expiring', isAuthenticated, async (req, res) => {
    try {
      const daysAhead = req.query.days ? parseInt(req.query.days as string) : 30;
      const agreements = await storage.getExpiringAgreements(daysAhead);
      res.json(agreements);
    } catch (error) {
      console.error("Error fetching expiring agreements:", error);
      res.status(500).json({ message: "Failed to fetch expiring agreements" });
    }
  });

  app.post('/api/agreements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const agreementData = { ...req.body, userId };
      const agreement = await storage.createAgreement(agreementData);
      res.json(agreement);
    } catch (error) {
      console.error("Error creating agreement:", error);
      res.status(500).json({ message: "Failed to create agreement" });
    }
  });

  app.post('/api/agreements/:id/renewal', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.requestAgreementRenewal(id);
      if (!success) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      res.json({ message: "Renewal request submitted successfully" });
    } catch (error) {
      console.error("Error requesting renewal:", error);
      res.status(500).json({ message: "Failed to request renewal" });
    }
  });

  // Quota management routes
  app.get('/api/quota-usage', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const quotaUsage = await storage.getUserQuotaUsage(userId);
      res.json(quotaUsage);
    } catch (error) {
      console.error("Error fetching quota usage:", error);
      res.status(500).json({ message: "Failed to fetch quota usage" });
    }
  });

  app.get('/api/quota-stats', isAuthenticated, async (req, res) => {
    try {
      const stats = {
        totalUsers: (await storage.getAllUsers()).length,
        totalQuotaUsage: (await storage.getUserQuotaUsage("admin-123")).reduce((sum, q) => sum + q.usedQuota, 0),
        activeQuotas: (await storage.getUserQuotaUsage("admin-123")).filter(q => q.remainingQuota > 0).length,
        expiredQuotas: (await storage.getUserQuotaUsage("admin-123")).filter(q => q.remainingQuota <= 0).length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching quota stats:", error);
      res.status(500).json({ message: "Failed to fetch quota stats" });
    }
  });

  app.post('/api/quota-usage/:userId/reset', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { quotaType } = req.body;
      const success = await storage.resetUserQuota(userId, quotaType);
      if (!success) {
        return res.status(404).json({ message: "Quota not found" });
      }
      res.json({ message: "Quota reset successfully" });
    } catch (error) {
      console.error("Error resetting quota:", error);
      res.status(500).json({ message: "Failed to reset quota" });
    }
  });

  // PNBP transaction routes
  app.get('/api/pnbp-transactions', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching PNBP transactions:", error);
      res.status(500).json({ message: "Failed to fetch PNBP transactions" });
    }
  });

  app.patch('/api/pnbp-transactions/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const success = await storage.updateTransactionStatus(id, status);
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ message: "Transaction status updated successfully" });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
