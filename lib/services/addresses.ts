"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/dal";

export interface AddressFormState {
  error?: string;
}

export async function addAddress(
  _prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const user = await requireUser();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!fullName || !phone || !addressLine1 || !city || !state || !/^\d{6}$/.test(postalCode)) {
    return { error: "Fill in all required fields with a valid 6-digit PIN code." };
  }

  const supabase = await createClient();

  if (isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    full_name: fullName,
    phone,
    address_line_1: addressLine1,
    address_line_2: addressLine2 || null,
    city,
    state,
    postal_code: postalCode,
    is_default: isDefault,
  });

  if (error) return { error: "Could not save this address. Please try again." };

  revalidatePath("/account");
  return {};
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/account");
}
