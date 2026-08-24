import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllBannersForAdmin } from "@/lib/repositories/admin/banners";
import { setBannerActiveAction } from "@/app/admin/(protected)/banners/actions";
import { PageHeader } from "@/components/admin/ui/page-header";
import { BannerBulkUpload } from "@/components/admin/banner-bulk-upload";
import cloudinaryLoader from "@/lib/cloudinary/loader";

export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const admin = createAdminClient();
  const banners = await listAllBannersForAdmin(admin);

  return (
    <div>
      <PageHeader
        title="Banners"
        description={`${banners.length} banner${banners.length === 1 ? "" : "s"} in the homepage hero carousel.`}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/banners/new">New Banner</Link>
          </Button>
        }
      />

      <BannerBulkUpload />

      <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Mobile Image</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Link href={`/admin/banners/${b.id}`} className="flex items-center gap-3 font-medium text-foreground hover:underline">
                    <span className="relative block size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      {b.desktop_image_url ? (
                        <Image
                          loader={cloudinaryLoader}
                          src={b.desktop_image_url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                          style={{ objectPosition: b.desktop_object_position }}
                        />
                      ) : (
                        <ImageIcon className="absolute inset-0 m-auto size-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </span>
                    {b.headline || "Untitled Slide"}
                  </Link>
                </TableCell>
                <TableCell>
                  {b.mobile_image_url ? (
                    <Badge variant="secondary">Custom</Badge>
                  ) : (
                    <Badge variant="outline">Uses laptop image</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {b.primary_cta_text || b.primary_cta_href || "Shop Now"}
                </TableCell>
                <TableCell className="text-muted-foreground">{b.sort_order}</TableCell>
                <TableCell>
                  {b.is_active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <form action={setBannerActiveAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="isActive" value={(!b.is_active).toString()} />
                    <Button type="submit" variant="ghost" size="sm">
                      {b.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {banners.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No banners found — the homepage hero is showing its built-in fallback images.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
