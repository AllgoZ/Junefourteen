import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

/** Caller-scoped: pass the cookie-bound server client so RLS enforces "own rows only". */
export async function listOrdersForUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listOrdersForUser: ${error.message}`);
  return data;
}

export async function getOrderWithItems(
  supabase: SupabaseClient<Database>,
  orderId: string
): Promise<{ order: OrderRow; items: OrderItemRow[] } | null> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) throw new Error(`getOrderWithItems: ${orderError.message}`);
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (itemsError) throw new Error(`getOrderWithItems items: ${itemsError.message}`);

  return { order, items: items ?? [] };
}

export interface NewOrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedSleeveOption?: string;
  customMeasurements?: Database["public"]["Tables"]["order_items"]["Row"]["custom_measurements"];
}

export interface NewOrder {
  userId: string | null;
  email: string;
  phone: string;
  subtotal: number;
  shippingAmount: number;
  total: number;
  shippingAddress: Database["public"]["Tables"]["orders"]["Row"]["shipping_address"];
  items: NewOrderItem[];
}

/**
 * Always called with the admin (service-role) client — there is no
 * client-writable RLS policy for orders/order_items by design (backend
 * brief §21/§23: order creation must go through server-computed pricing,
 * never a direct client insert). See app/checkout/actions.ts for the
 * pricing computation that produces this input.
 */
export async function createOrder(
  admin: SupabaseClient<Database>,
  input: NewOrder
): Promise<{ id: string; orderNumber: string }> {
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: input.userId,
      email: input.email,
      phone: input.phone,
      subtotal: input.subtotal,
      shipping_amount: input.shippingAmount,
      total: input.total,
      shipping_address: input.shippingAddress,
    })
    .select("id, order_number")
    .single();
  if (orderError || !order) throw new Error(`createOrder: ${orderError?.message}`);

  const { error: itemsError } = await admin.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_slug: item.productSlug,
      product_image: item.productImage,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      selected_size: item.selectedSize ?? null,
      selected_sleeve_option: item.selectedSleeveOption ?? null,
      custom_measurements: item.customMeasurements ?? null,
    }))
  );
  if (itemsError) throw new Error(`createOrder items: ${itemsError.message}`);

  return { id: order.id, orderNumber: order.order_number };
}
