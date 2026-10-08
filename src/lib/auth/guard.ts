import { redirect } from "next/navigation";
import type { Role, User } from "@/lib/api/types";
import { getCurrentUser, getSession, roleHome } from "@/lib/auth/session";

/**
 * Server Component / Layout guard that requires one of the specified roles.
 * If not authenticated, redirects to /login?next=.
 * If wrong role, redirects to their own role home with ?denied=1.
 */
export async function requireRole(allowedRoles: Role | Role[]): Promise<User> {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!roles.includes(session.role)) {
    const home = roleHome(session.role);
    redirect(`${home}?denied=1`);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
