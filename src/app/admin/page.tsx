import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/supabase/auth";

export default async function AdminPage() {
  await requireStaff("/admin");
  redirect("/admin/animals");
}
