import type { CurrentUser } from "./auth";

/** Prisma `where` fragment limiting rows to the user's center (super admins see all). */
export function centerScope(user: CurrentUser): { centerId?: string } {
  return user.role === "SUPER_ADMIN" ? {} : { centerId: user.centerId ?? "__none__" };
}
