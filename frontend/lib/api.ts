import axios from "axios"
import { toast } from "@/components/ui/use-toast"

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    // Handle different error statuses
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            window.location.href = "/login"
          }
          break
        case 403:
          // Forbidden
          toast({
            title: "Access Denied",
            description: "You don't have permission to perform this action.",
            variant: "destructive",
          })
          break
        case 404:
          // Not found
          toast({
            title: "Not Found",
            description: "The requested resource was not found.",
            variant: "destructive",
          })
          break
        case 422:
          // Validation error
          const validationErrors = response.data.errors || response.data.message || "Validation failed"
          toast({
            title: "Validation Error",
            description: typeof validationErrors === "string" ? validationErrors : "Please check your input",
            variant: "destructive",
          })
          break
        case 500:
          // Server error
          toast({
            title: "Server Error",
            description: "An unexpected error occurred. Please try again later.",
            variant: "destructive",
          })
          break
        default:
          // Other errors
          toast({
            title: "Error",
            description: response.data.message || "Something went wrong",
            variant: "destructive",
          })
      }
    } else {
      // Network error
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      })
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) => api.post("/auth/login", credentials),
  register: (userData: { name: string; email: string; password: string }) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
}

// Users API
export const userApi = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (userData: any) => api.post("/users", userData),
  update: (id: string, userData: any) => api.patch(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
}

// Assets API
export const assetApi = {
  getAll: (params?: any) => api.get("/assets", { params }),
  getById: (id: string) => api.get(`/assets/${id}`),
  create: (assetData: any) => api.post("/assets", assetData),
  update: (id: string, assetData: any) => api.patch(`/assets/${id}`, assetData),
  delete: (id: string) => api.delete(`/assets/${id}`),
  uploadFiles: (formData: FormData) =>
    api.post("/assets/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  assignToUser: (assetId: string, userId: string) => api.patch(`/assets/${assetId}/assign-to-user/${userId}`),
  assignToDepartment: (assetId: string, department: string) =>
    api.patch(`/assets/${assetId}/assign-to-department/${department}`),
  unassign: (assetId: string) => api.patch(`/assets/${assetId}/unassign`),
  generateQrCode: (assetId: string) => api.get(`/assets/${assetId}/qrcode`),
  getAssetsByUser: (userId: string) => api.get(`/assets/user/${userId}`),
  getAssetsByDepartment: (department: string) => api.get(`/assets/department/${department}`),
  getAssignmentHistory: (assetId: string) => api.get(`/assets/${assetId}/history`),

  // Asset Transfers
  createTransfer: (transferData: any) => api.post("/asset-transfers", transferData),
  getTransfers: (params?: any) => api.get("/asset-transfers", { params }),
  getTransferById: (id: string) => api.get(`/asset-transfers/${id}`),
  updateTransfer: (id: string, transferData: any) => api.patch(`/asset-transfers/${id}`, transferData),
  deleteTransfer: (id: string) => api.delete(`/asset-transfers/${id}`),
  approveTransfer: (id: string) => api.patch(`/asset-transfers/${id}/approve`),
  rejectTransfer: (id: string, data: { notes?: string }) => api.patch(`/asset-transfers/${id}/reject`, data),
  getPendingTransfers: () => api.get("/asset-transfers/pending"),
  getAssetTransferHistory: (assetId: string) => api.get(`/asset-transfers/asset/${assetId}`),
  getUserTransferHistory: (userId: string) => api.get(`/asset-transfers/user/${userId}`),
  getDepartmentTransferHistory: (department: string) => api.get(`/asset-transfers/department/${department}`),
}

// Maintenance API
export const maintenanceApi = {
  getAll: (params?: any) => api.get("/maintenance", { params }),
  getById: (id: string) => api.get(`/maintenance/${id}`),
  create: (maintenanceData: any) => api.post("/maintenance", maintenanceData),
  update: (id: string, maintenanceData: any) => api.patch(`/maintenance/${id}`, maintenanceData),
  delete: (id: string) => api.delete(`/maintenance/${id}`),
  getByAsset: (assetId: string) => api.get(`/maintenance/asset/${assetId}`),
}

// Inventory API
export const inventoryApi = {
  getAll: (params?: any) => api.get("/inventory", { params }),
  getById: (id: string) => api.get(`/inventory/${id}`),
  create: (inventoryData: any) => api.post("/inventory", inventoryData),
  update: (id: string, inventoryData: any) => api.patch(`/inventory/${id}`, inventoryData),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get("/inventory/low-stock"),

  // Stock Transactions
  createTransaction: (transactionData: any) => api.post("/inventory/transactions", transactionData),
  getTransactions: (params?: any) => api.get("/inventory/transactions", { params }),
  getTransactionById: (id: string) => api.get(`/inventory/transactions/${id}`),
  getItemTransactions: (itemId: string) => api.get(`/inventory/transactions/item/${itemId}`),
}

// Branches API
export const branchApi = {
  getAll: () => api.get("/branches"),
  getById: (id: string) => api.get(`/branches/${id}`),
  create: (branchData: any) => api.post("/branches", branchData),
  update: (id: string, branchData: any) => api.patch(`/branches/${id}`, branchData),
  delete: (id: string) => api.delete(`/branches/${id}`),
  getBranchAssets: (id: string) => api.get(`/branches/${id}/assets`),
  getBranchInventory: (id: string) => api.get(`/branches/${id}/inventory`),
  getBranchUsers: (id: string) => api.get(`/branches/${id}/users`),
  getBranchStatistics: (id: string) => api.get(`/branches/${id}/statistics`),
  transferAssetToBranch: (branchId: string, assetId: string, userId: string) =>
    api.patch(`/branches/${branchId}/transfer-asset/${assetId}?userId=${userId}`),
}

// Notifications API
export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  getUnread: () => api.get("/notifications/unread"),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

// Asset Checkouts API
export const checkoutApi = {
  getAll: (params?: any) => api.get("/asset-checkouts", { params }),
  getById: (id: string) => api.get(`/asset-checkouts/${id}`),
  create: (checkoutData: any) => api.post("/asset-checkouts", checkoutData),
  update: (id: string, checkoutData: any) => api.patch(`/asset-checkouts/${id}`, checkoutData),
  delete: (id: string) => api.delete(`/asset-checkouts/${id}`),
  returnAsset: (id: string, notes?: string) => api.patch(`/asset-checkouts/${id}/return`, { notes }),
  getActiveCheckouts: () => api.get("/asset-checkouts/active"),
  getOverdueCheckouts: () => api.get("/asset-checkouts/overdue"),
  getAssetCheckoutHistory: (assetId: string) => api.get(`/asset-checkouts/asset/${assetId}`),
  getUserCheckoutHistory: (userId: string) => api.get(`/asset-checkouts/user/${userId}`),
  getMyCheckouts: () => api.get("/asset-checkouts/my-checkouts"),
  checkoutByQrCode: (qrData: string, dueDate: Date, purpose?: string) =>
    api.post("/asset-checkouts/qr-checkout", { qrData, dueDate, purpose }),
}

// Audit API
export const auditApi = {
  getLogs: (params?: any) => api.get("/audit/logs", { params }),
  getAssetAuditTrail: (assetId: string) => api.get(`/audit/logs/asset/${assetId}`),
  verifyAuditLog: (id: string) => api.post(`/audit/logs/${id}/verify`),
  verifyChainIntegrity: (params?: { startDate?: Date; endDate?: Date }) => api.get("/audit/verify-chain", { params }),
  getAuditStatistics: () => api.get("/audit/statistics"),
}

// Certificate API
export const certificateApi = {
  getAll: () => api.get("/certificates"),
  getById: (id: string) => api.get(`/certificates/${id}`),
  getByNumber: (certificateNumber: string) => api.get(`/certificates/number/${certificateNumber}`),
  getAssetCertificates: (assetId: string) => api.get(`/certificates/asset/${assetId}`),
  getUserCertificates: (userId: string) => api.get(`/certificates/user/${userId}`),
  getMyCertificates: () => api.get("/certificates/my-certificates"),
  issueCertificate: (certificateData: any) => api.post("/certificates", certificateData),
  transferCertificate: (id: string, toUserId: string) => api.put(`/certificates/${id}/transfer/${toUserId}`),
  revokeCertificate: (id: string, reason: string) => api.put(`/certificates/${id}/revoke`, { reason }),
  verifyCertificate: (id: string) => api.get(`/certificates/${id}/verify`),
  generateQrCode: (id: string) => api.get(`/certificates/${id}/qrcode`),
}

export { api }
