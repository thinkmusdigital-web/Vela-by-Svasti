import { getCurrentUser } from "@/lib/auth";
import { jsonError, json } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      lastLoginAt: user.lastLoginAt,
    },
  });
}