import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { legalConfig } from "@/lib/legal";

type SiteFooterProps = {
  showMarketingLinks?: boolean;
};

const legalLinks = [
  { href: "/legal", label: "Legal Center" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refunds-and-cancellations", label: "Refunds" },
  { href: "/shipping-and-delivery", label: "Delivery" },
  { href: "/contact-us", label: "Contact" },
] as const;

const marketingLinks = [
  { href: "#features", label: "Features" },
  { href: "/login", label: "Login" },
] as const;

export function SiteFooter({
  showMarketingLinks = true,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 px-4 py-10 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <BrandLogo theme="dark" />
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {legalConfig.productAttribution} AI-powered review funnels for local
              businesses, agencies, and multi-location teams.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-sm sm:flex-row sm:gap-8">
            {showMarketingLinks ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Explore</p>
                <div className="flex flex-wrap gap-4 text-slate-500">
                  {marketingLinks.map((link) =>
                    link.href.startsWith("/") ? (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="transition hover:text-brand"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        key={link.href}
                        href={link.href}
                        className="transition hover:text-brand"
                      >
                        {link.label}
                      </a>
                    ),
                  )}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="font-semibold text-slate-900">Legal</p>
              <div className="flex flex-wrap gap-4 text-slate-500">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition hover:text-brand"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {legalConfig.brandName}, a product of{" "}
            {legalConfig.parentCompany}. All rights reserved.
          </p>
          <p>Current free tier: 2 links per month and 100 scripts per link.</p>
        </div>
      </div>
    </footer>
  );
}
