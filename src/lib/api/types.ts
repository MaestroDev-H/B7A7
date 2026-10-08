/**
 * Decimal is represented as string in backend JSON responses from Prisma.
 */
export type Decimal = string;

export type Role = "ADMIN" | "OWNER" | "TENANT";

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "STUDIO"
  | "CONDO"
  | "VILLA"
  | "ROOM";

export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "UNDER_MAINTENANCE";

export type ViewingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export type TenancyStatus = "ACTIVE" | "TERMINATED" | "EXPIRED";

export type InvoiceType =
  | "RENT"
  | "UTILITY"
  | "DEPOSIT"
  | "MAINTENANCE"
  | "OTHER";

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export type PaymentStatus = "INITIATED" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type MaintenanceStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type NotificationType =
  | "VIEWING"
  | "APPLICATION"
  | "TENANCY"
  | "INVOICE"
  | "PAYMENT"
  | "MAINTENANCE"
  | "SYSTEM";

// Base Response Envelopes
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// Entity Models
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatar?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  address: string;
  city: string;
  area?: string | null;
  amenities: string[];
  images: string[];
  isPublished: boolean;
  ownerId: string;
  owner?: User;
  rooms?: Room[];
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  currentOccupancy: number;
  rentAmount: Decimal;
  depositAmount: Decimal;
  description?: string | null;
  status: RoomStatus;
  propertyId: string;
  property?: Property;
  createdAt: string;
  updatedAt: string;
}

export interface RoommatePreference {
  id: string;
  userId: string;
  user?: User;
  budgetMin: number | Decimal;
  budgetMax: number | Decimal;
  preferredCity?: string | null;
  preferredArea?: string | null;
  genderPreference?: string | null;
  lifestyleTags: string[];
  moveInFrom?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoommateMatch {
  user: User;
  preference: RoommatePreference;
  matchScore: number;
  matchingTags: string[];
}

export interface ViewingRequest {
  id: string;
  tenantId: string;
  tenant?: User;
  roomId: string;
  room?: Room & { property?: Property };
  propertyId?: string;
  property?: Property;
  requestedDate: string;
  status: ViewingStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  tenantId: string;
  tenant?: User;
  roomId: string;
  room?: Room & { property?: Property };
  moveInDate: string;
  message?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Tenancy {
  id: string;
  tenantId: string;
  tenant?: User;
  roomId: string;
  room?: Room & { property?: Property };
  rentAmount: Decimal;
  depositAmount: Decimal;
  startDate: string;
  endDate?: string | null;
  status: TenancyStatus;
  invoices?: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  tenancyId: string;
  tenancy?: Tenancy & { tenant?: User; room?: Room & { property?: Property } };
  type: InvoiceType;
  amount: Decimal;
  dueDate: string;
  status: InvoiceStatus;
  paidAt?: string | null;
  description?: string | null;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  tenantId: string;
  tenant?: User;
  amount: Decimal;
  status: PaymentStatus;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRequest {
  id: string;
  tenancyId: string;
  tenancy?: Tenancy & { tenant?: User; room?: Room & { property?: Property } };
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  images: string[];
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalTenants: number;
  totalProperties: number;
  totalRooms: number;
  activeTenancies: number;
  pendingApplications: number;
  totalRevenue: Decimal | number;
}
