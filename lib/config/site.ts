export const site = {
  name: "JUNEFOURTEEN",
  tagline: "Quietly Bold",
  description:
    "JUNEFOURTEEN is a premium women's ethnic-contemporary fashion label — handloom textiles and considered tailoring, made for the way you move.",
  url: "https://www.junefourteen.example",
  currency: "INR",
  currencySymbol: "₹",
  contactEmail: "hello@junefourteen.example",
  contactPhone: "+91 98765 43210",
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
  nav: {
    primary: [
      { label: "Shop", href: "/shop" },
      { label: "Collections", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
    ],
  },
  footer: {
    shop: [
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "All Products", href: "/shop" },
      { label: "Collections", href: "/shop" },
      { label: "Best Sellers", href: "/shop?sort=best-selling" },
    ],
    help: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "FAQs", href: "/faq" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Our Story", href: "/about#story" },
      { label: "Journal", href: "/about#journal" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refund Policy", href: "/returns" },
    ],
  },
} as const;
