/**
 * Hand-written to match supabase/migrations/*.sql exactly (the Supabase
 * CLI's `gen types typescript` needs a running Docker daemon for schema
 * introspection, which isn't available in this environment). Keep this in
 * sync whenever a migration changes the schema.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          tone: number;
          image_url: string | null;
          image_alt: string | null;
          cloudinary_public_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          tone?: number;
          image_url?: string | null;
          image_alt?: string | null;
          cloudinary_public_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          short_description: string;
          price: number;
          compare_at_price: number | null;
          category: string;
          tags: string[];
          is_new: boolean;
          is_best_seller: boolean;
          is_sold_out: boolean;
          is_active: boolean;
          custom_size_enabled: boolean;
          fabric: string;
          wash_care: string[];
          shipping_info: string;
          fit_notes: string;
          sort_order: number;
          stock_quantity: number;
          low_stock_threshold: number;
          size_chart_image_url: string | null;
          size_chart_cloudinary_public_id: string | null;
          size_chart_image_alt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          short_description?: string;
          price: number;
          compare_at_price?: number | null;
          category: string;
          tags?: string[];
          is_new?: boolean;
          is_best_seller?: boolean;
          is_sold_out?: boolean;
          is_active?: boolean;
          custom_size_enabled?: boolean;
          fabric?: string;
          wash_care?: string[];
          shipping_info?: string;
          fit_notes?: string;
          sort_order?: number;
          stock_quantity?: number;
          low_stock_threshold?: number;
          size_chart_image_url?: string | null;
          size_chart_cloudinary_public_id?: string | null;
          size_chart_image_alt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          desktop_image_url: string;
          desktop_image_alt: string;
          desktop_cloudinary_public_id: string | null;
          desktop_object_position: string;
          mobile_image_url: string | null;
          mobile_image_alt: string;
          mobile_cloudinary_public_id: string | null;
          mobile_object_position: string;
          tone: number;
          badge_text: string | null;
          headline: string;
          subheading: string | null;
          primary_cta_href: string | null;
          primary_cta_text: string | null;
          secondary_cta_text: string | null;
          secondary_cta_href: string | null;
          offer_badge_text: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          desktop_image_url: string;
          desktop_image_alt?: string;
          desktop_cloudinary_public_id?: string | null;
          desktop_object_position?: string;
          mobile_image_url?: string | null;
          mobile_image_alt?: string;
          mobile_cloudinary_public_id?: string | null;
          mobile_object_position?: string;
          tone?: number;
          badge_text?: string | null;
          headline?: string;
          subheading?: string | null;
          primary_cta_href?: string | null;
          primary_cta_text?: string | null;
          secondary_cta_text?: string | null;
          secondary_cta_href?: string | null;
          offer_badge_text?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["banners"]["Insert"]>;
        Relationships: [];
      };
      social_links: {
        Row: {
          id: string;
          label: string;
          href: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          href: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["social_links"]["Insert"]>;
        Relationships: [];
      };
      product_collections: {
        Row: { product_id: string; collection_id: string; sort_order: number };
        Insert: { product_id: string; collection_id: string; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["product_collections"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          cloudinary_public_id: string | null;
          image_url: string;
          alt: string;
          tone: number;
          width: number | null;
          height: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          cloudinary_public_id?: string | null;
          image_url: string;
          alt?: string;
          tone?: number;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      product_sizes: {
        Row: { product_id: string; size: string; sort_order: number };
        Insert: { product_id: string; size: string; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["product_sizes"]["Insert"]>;
        Relationships: [];
      };
      product_sleeve_options: {
        Row: { product_id: string; sleeve_option: string; sort_order: number };
        Insert: { product_id: string; sleeve_option: string; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["product_sleeve_options"]["Insert"]>;
        Relationships: [];
      };
      product_pieces: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price: number;
          default_selected: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price: number;
          default_selected?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_pieces"]["Insert"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [];
      };
      carts: {
        Row: { id: string; user_id: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["carts"]["Insert"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          size: string | null;
          sleeve_option: string | null;
          custom_measurements: Json | null;
          selected_piece_ids: Json | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          size?: string | null;
          sleeve_option?: string | null;
          custom_measurements?: Json | null;
          selected_piece_ids?: Json | null;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
        Relationships: [];
      };
      wishlist_items: {
        Row: { id: string; user_id: string; product_id: string; created_at: string };
        Insert: { id?: string; user_id: string; product_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          email: string;
          phone: string;
          status: string;
          payment_status: string;
          subtotal: number;
          shipping_amount: number;
          discount_amount: number;
          total: number;
          currency: string;
          shipping_address: Json;
          billing_address: Json | null;
          tracking_number: string | null;
          tracking_url: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          tax_amount: number;
          coupon_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          email: string;
          phone: string;
          status?: string;
          payment_status?: string;
          subtotal: number;
          shipping_amount?: number;
          discount_amount?: number;
          total: number;
          currency?: string;
          shipping_address: Json;
          billing_address?: Json | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          tax_amount?: number;
          coupon_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_slug: string;
          product_image: string | null;
          unit_price: number;
          quantity: number;
          selected_size: string | null;
          selected_sleeve_option: string | null;
          custom_measurements: Json | null;
          selected_pieces: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_slug: string;
          product_image?: string | null;
          unit_price: number;
          quantity: number;
          selected_size?: string | null;
          selected_sleeve_option?: string | null;
          custom_measurements?: Json | null;
          selected_pieces?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      shipping_zones: {
        Row: {
          id: string;
          name: string;
          states: string[];
          rate: number;
          free_shipping_threshold: number | null;
          eta_min_days: number;
          eta_max_days: number;
          is_default: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          states?: string[];
          rate: number;
          free_shipping_threshold?: number | null;
          eta_min_days: number;
          eta_max_days: number;
          is_default?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shipping_zones"]["Insert"]>;
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          min_order_amount: number;
          max_discount_amount: number | null;
          starts_at: string | null;
          expires_at: string | null;
          usage_limit: number | null;
          times_used: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          min_order_amount?: number;
          max_discount_amount?: number | null;
          starts_at?: string | null;
          expires_at?: string | null;
          usage_limit?: number | null;
          times_used?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
        Relationships: [];
      };
      tax_settings: {
        Row: {
          id: boolean;
          rate_percent: number;
          label: string;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          rate_percent?: number;
          label?: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tax_settings"]["Insert"]>;
        Relationships: [];
      };
      homepage_campaign: {
        Row: {
          id: boolean;
          image_url: string;
          cloudinary_public_id: string | null;
          image_alt: string;
          tone: number;
          link_label: string;
          link_href: string;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          image_url: string;
          cloudinary_public_id?: string | null;
          image_alt?: string;
          tone?: number;
          link_label?: string;
          link_href?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_campaign"]["Insert"]>;
        Relationships: [];
      };
      homepage_gallery_images: {
        Row: {
          id: string;
          image_url: string;
          cloudinary_public_id: string | null;
          image_alt: string;
          tone: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          cloudinary_public_id?: string | null;
          image_alt?: string;
          tone?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_gallery_images"]["Insert"]>;
        Relationships: [];
      };
      about_page_content: {
        Row: {
          id: boolean;
          hero_image_url: string;
          hero_cloudinary_public_id: string | null;
          hero_image_alt: string;
          heading: string;
          intro_body: string;
          story_eyebrow: string;
          story_title: string;
          story_body: string;
          story_image_url: string;
          story_cloudinary_public_id: string | null;
          story_image_alt: string;
          philosophy_eyebrow: string;
          philosophy_title: string;
          philosophy_body: string;
          philosophy_image_url: string;
          philosophy_cloudinary_public_id: string | null;
          philosophy_image_alt: string;
          journal_eyebrow: string;
          journal_title: string;
          journal_body: string;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          hero_image_url: string;
          hero_cloudinary_public_id?: string | null;
          hero_image_alt?: string;
          heading?: string;
          intro_body?: string;
          story_eyebrow?: string;
          story_title?: string;
          story_body?: string;
          story_image_url: string;
          story_cloudinary_public_id?: string | null;
          story_image_alt?: string;
          philosophy_eyebrow?: string;
          philosophy_title?: string;
          philosophy_body?: string;
          philosophy_image_url: string;
          philosophy_cloudinary_public_id?: string | null;
          philosophy_image_alt?: string;
          journal_eyebrow?: string;
          journal_title?: string;
          journal_body?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["about_page_content"]["Insert"]>;
        Relationships: [];
      };
      legal_pages: {
        Row: { slug: string; title: string; subtitle: string; body: string; updated_at: string };
        Insert: { slug: string; title: string; subtitle?: string; body?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["legal_pages"]["Insert"]>;
        Relationships: [];
      };
      order_requests: {
        Row: {
          id: string;
          product_id: string | null;
          product_name: string;
          product_slug: string;
          user_id: string | null;
          customer_name: string;
          phone: string;
          email: string | null;
          size: string;
          quantity: number;
          delivery_address: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          product_name: string;
          product_slug: string;
          user_id?: string | null;
          customer_name: string;
          phone: string;
          email?: string | null;
          size: string;
          quantity: number;
          delivery_address: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_requests"]["Insert"]>;
        Relationships: [];
      };
      rate_limit_hits: {
        Row: { id: number; key: string; created_at: string };
        Insert: { id?: number; key: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["rate_limit_hits"]["Insert"]>;
        Relationships: [];
      };
      schema_migrations: {
        Row: { filename: string; applied_at: string };
        Insert: { filename: string; applied_at?: string };
        Update: Partial<Database["public"]["Tables"]["schema_migrations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
