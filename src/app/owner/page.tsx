import { getCurrentUser } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/guard";

export default async function OwnerPage() {
  await requireRole("OWNER");
  const user = await getCurrentUser();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold font-display">Owner Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as: <strong className="text-foreground">{user?.name}</strong> ({user?.email}) - Role: <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{user?.role}</span>
      </p>
    </div>
  );
}
