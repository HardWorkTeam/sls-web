import { API_URL } from "../site-config";

export type PackageCapabilities = {
  modules: Record<string, boolean>;
  guest_limit: number | null;
  invitation_design_limit: number | null;
};

export type Package = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  features: string[];
  capabilities: PackageCapabilities;
  is_active: boolean;
};

export type TemplateConfig = {
  primary_color?: string;
  font?: string;
  layout?: string;
};

export type Template = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  preview_image_path: string | null;
  config: TemplateConfig | null;
  is_active: boolean;
};

/** Laravel API Resource collections wrap their payload in `{ data: [...] }`. */
async function fetchCollection<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      // Catalog rarely changes; cache and refresh in the background.
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: T[] };
    return json.data ?? [];
  } catch {
    // Backend unreachable at render time — fail soft so the page still loads.
    return [];
  }
}

export function getPackages(): Promise<Package[]> {
  return fetchCollection<Package>("/public/packages?active_only=true");
}

export function getTemplates(): Promise<Template[]> {
  return fetchCollection<Template>("/public/invitation-templates");
}

/** Format a package price using its currency (no trailing cents). */
export function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "Custom";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

/**
 * Pick the package to highlight as "most popular". There is no backend flag for
 * this, so we choose the best-value full plan: the one unlocking the most
 * modules, and among ties the cheapest. Returns the package id, or null.
 */
export function featuredPackageId(packages: Package[]): number | null {
  let best: Package | null = null;
  let bestModules = -1;
  for (const p of packages) {
    const enabled = Object.values(p.capabilities?.modules ?? {}).filter(
      Boolean,
    ).length;
    const price = p.price ?? Infinity;
    const bestPrice = best?.price ?? Infinity;
    if (
      enabled > bestModules ||
      (enabled === bestModules && price < bestPrice)
    ) {
      best = p;
      bestModules = enabled;
    }
  }
  return best?.id ?? null;
}
