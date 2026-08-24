"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateProductStock } from "@/lib/repositories/admin/inventory";

export async function updateStockAction(productId: string, stockQuantity: number): Promise<void> {
  await requireAdmin();
  if (!Number.isFinite(stockQuantity) || stockQuantity < 0) return;

  const admin = createAdminClient();
  await updateProductStock(admin, productId, Math.trunc(stockQuantity));
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
