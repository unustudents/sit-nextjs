import "server-only";
import { requireUser } from "./require-user";
import { forbidden } from "next/navigation";

export async function requireAdmin() {
  const context = await requireUser();

  if (context.profile.role !== "admin") {
    forbidden();
  }

  return context;
}
