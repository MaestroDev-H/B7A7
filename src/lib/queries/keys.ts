export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
    me: ["auth", "me"] as const,
  },
  users: {
    all: (params?: Record<string, unknown>) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  properties: {
    all: (params?: Record<string, unknown>) => ["properties", "list", params] as const,
    detail: (id: string) => ["properties", "detail", id] as const,
    my: (params?: Record<string, unknown>) => ["properties", "my", params] as const,
  },
  rooms: {
    all: (params?: Record<string, unknown>) => ["rooms", "list", params] as const,
    detail: (id: string) => ["rooms", "detail", id] as const,
  },
  roommates: {
    preference: ["roommates", "preference"] as const,
    matches: ["roommates", "matches"] as const,
    matchingRooms: ["roommates", "matching-rooms"] as const,
  },
  viewings: {
    mine: ["viewings", "mine"] as const,
    incoming: (params?: Record<string, unknown>) => ["viewings", "incoming", params] as const,
  },
  applications: {
    mine: ["applications", "mine"] as const,
    incoming: (params?: Record<string, unknown>) => ["applications", "incoming", params] as const,
  },
  tenancies: {
    mine: ["tenancies", "mine"] as const,
    all: (params?: Record<string, unknown>) => ["tenancies", "all", params] as const,
    detail: (id: string) => ["tenancies", "detail", id] as const,
    myInvoices: ["tenancies", "my-invoices"] as const,
  },
  payments: {
    history: (params?: Record<string, unknown>) => ["payments", "history", params] as const,
    invoice: (id: string) => ["payments", "invoice", id] as const,
  },
  maintenance: {
    mine: (params?: Record<string, unknown>) => ["maintenance", "mine", params] as const,
    incoming: (params?: Record<string, unknown>) => ["maintenance", "incoming", params] as const,
  },
  notifications: {
    all: (unreadOnly?: boolean) => ["notifications", { unreadOnly }] as const,
  },
  admin: {
    stats: ["admin", "stats"] as const,
    auditLogs: (params?: Record<string, unknown>) => ["admin", "audit-logs", params] as const,
  },
};
