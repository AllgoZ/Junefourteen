import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface NewOrderRequest {
  productId: string | null;
  productName: string;
  productSlug: string;
  customerName: string;
  phone: string;
  email: string | null;
  size: string;
  quantity: number;
  deliveryAddress: string;
}

/** Always called with the admin (service-role) client — no client-writable RLS policy exists for this table by design (see the migration). */
export async function createOrderRequest(admin: SupabaseClient<Database>, input: NewOrderRequest): Promise<void> {
  const { error } = await admin.from("order_requests").insert({
    product_id: input.productId,
    product_name: input.productName,
    product_slug: input.productSlug,
    customer_name: input.customerName,
    phone: input.phone,
    email: input.email,
    size: input.size,
    quantity: input.quantity,
    delivery_address: input.deliveryAddress,
  });
  if (error) throw new Error(`createOrderRequest: ${error.message}`);
}
