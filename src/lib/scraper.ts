type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const DEFAULT_RETURN_DAYS = 30;
const DEFAULT_RESTOCK_FEE_PCT = 0;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 999;
const DEFAULT_SHIPPING_SPEED = "standard";
const DEFAULT_CS_RESPONSE_TIME = "unknown";

const COMMON_POLICY_PATHS = [
  "/pages/returns",
  "/returns",
  "/return-policy",
  "/returns-exchanges",
  "/refund-policy",
  "/pages/shipping",
  "/shipping",
  "/shipping-policy",
  "/delivery",
];

export type BrandScoreRecord = {
  brand_name: string;
  domain: string;
  return_days: number;
  restock_fee_pct: number;
  free_shipping_threshold: number;
  shipping_speed: string;
  lifetime_warranty: boolean;
  price_match_guarantee: boolean;
  cs_response_time: string;
  overall_score: number;
  last_updated: string;
  data_source: string;
  created_at: string;
};

type ExtractedMetrics = Pick<
  BrandScoreRecord,
  | "return_days"
  | "restock_fee_pct"
  | "free_shipping_threshold"
  | "shipping_speed"
  | "lifetime_warranty"
  | "price_match_guarantee"
>;

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function domainToBrandName(domain: string): string {
  const label = normalizeDomain(domain).split(".")[0] ?? domain;
  return label
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&dollar;/gi, "$")
    .replace(/&#36;/g, "$")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace(/,/g, ""));
}

function extractFirstNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      return Number.parseFloat(match[1]);
    }
  }

  return null;
}

function extractReturnDays(text: string): number {
  const days = extractFirstNumber(text, [
    /(?:return|returns|returned|exchange|exchanges)(?:.{0,120}?)within\s+(\d{1,3})\s*days?/i,
    /(\d{1,3})\s*[- ]?day(?:s)?\s+(?:return|returns|return policy|return window)/i,
    /(\d{1,3})\s*days?\s+to\s+return/i,
    /eligible for return(?:s)?(?:.{0,80}?)\b(\d{1,3})\s*days?/i,
  ]);

  return days ?? DEFAULT_RETURN_DAYS;
}

function extractRestockFeePct(text: string): number {
  if (/(?:no|without)\s+restock(?:ing)?\s+fee/i.test(text)) {
    return 0;
  }

  const fee = extractFirstNumber(text, [
    /(\d{1,2}(?:\.\d+)?)\s*%\s+restock(?:ing)?\s+fee/i,
    /restock(?:ing)?\s+fee(?:\s+of)?\s+(\d{1,2}(?:\.\d+)?)\s*%/i,
  ]);

  return fee ?? DEFAULT_RESTOCK_FEE_PCT;
}

function extractFreeShippingThreshold(text: string): number {
  if (/free shipping (?:on|for)\s+all orders/i.test(text)) {
    return 0;
  }

  const matches = [
    ...text.matchAll(/free shipping(?:.{0,80}?)\$\s?(\d+(?:\.\d{1,2})?)/gi),
    ...text.matchAll(/orders? (?:over|above|of)\s+\$\s?(\d+(?:\.\d{1,2})?)(?:.{0,80}?)free shipping/gi),
    ...text.matchAll(/spend\s+\$\s?(\d+(?:\.\d{1,2})?)(?:.{0,80}?)free shipping/gi),
  ]
    .map((match) => parseCurrency(match[1]))
    .filter((value) => Number.isFinite(value));

  if (matches.length === 0) {
    return DEFAULT_FREE_SHIPPING_THRESHOLD;
  }

  return Math.min(...matches);
}

function extractShippingSpeed(text: string): string {
  if (/same[-\s]?day/i.test(text)) {
    return "same-day";
  }

  if (/next[-\s]?day/i.test(text)) {
    return "next-day";
  }

  if (/\b2[-\s]?day\b|\btwo[-\s]?day\b/i.test(text)) {
    return "2-day";
  }

  if (/express|expedited|priority/i.test(text)) {
    return "express";
  }

  if (/\b3\s*[-–]\s*5\b|\b5\s*[-–]\s*7\b|standard shipping|business days/i.test(text)) {
    return "standard";
  }

  return DEFAULT_SHIPPING_SPEED;
}

export function extractLifetimeWarranty(text: string): boolean {
  return [
    /lifetime warranty/i,
    /lifetime guarantee/i,
    /limited lifetime warranty/i,
    /lifetime limited warranty/i,
    /backed by our lifetime warranty/i,
    /warranty for life/i,
  ].some((pattern) => pattern.test(text));
}

export function extractPriceMatchGuarantee(text: string): boolean {
  return [
    /price match/i,
    /we will match any price/i,
    /beat any price/i,
    /lowest price guarantee/i,
    /match competitor pricing/i,
  ].some((pattern) => pattern.test(text));
}

export function extractPolicyMetrics(html: string): ExtractedMetrics {
  const text = stripHtml(html);

  return {
    return_days: extractReturnDays(text),
    restock_fee_pct: extractRestockFeePct(text),
    free_shipping_threshold: extractFreeShippingThreshold(text),
    shipping_speed: extractShippingSpeed(text),
    lifetime_warranty: extractLifetimeWarranty(text),
    price_match_guarantee: extractPriceMatchGuarantee(text),
  };
}

export function calculateOverallScore(metrics: ExtractedMetrics): number {
  const returnScore = Math.min(60, (metrics.return_days / 90) * 60);
  const restockScore =
    metrics.restock_fee_pct === 0
      ? 25
      : Math.max(0, 25 - metrics.restock_fee_pct * 2.5);
  const shippingScore =
    metrics.free_shipping_threshold === 0
      ? 15
      : Math.max(0, 15 - (Math.min(metrics.free_shipping_threshold, 150) / 150) * 15);
  const lifetimeWarrantyBonus = metrics.lifetime_warranty ? 15 : 0;
  const priceMatchGuaranteeBonus = metrics.price_match_guarantee ? 10 : 0;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(returnScore + restockScore + shippingScore + lifetimeWarrantyBonus + priceMatchGuaranteeBonus),
    ),
  );
}

function buildRecord(domain: string, metrics: ExtractedMetrics, source: string): BrandScoreRecord {
  const timestamp = new Date().toISOString();

  return {
    brand_name: domainToBrandName(domain),
    domain: normalizeDomain(domain),
    return_days: metrics.return_days,
    restock_fee_pct: metrics.restock_fee_pct,
    free_shipping_threshold: metrics.free_shipping_threshold,
    shipping_speed: metrics.shipping_speed,
    lifetime_warranty: metrics.lifetime_warranty,
    price_match_guarantee: metrics.price_match_guarantee,
    cs_response_time: DEFAULT_CS_RESPONSE_TIME,
    overall_score: calculateOverallScore(metrics),
    last_updated: timestamp,
    data_source: source,
    created_at: timestamp,
  };
}

type DiscoveredLink = {
  href: string;
  score: number;
};

function toAbsoluteUrl(domain: string, href: string): string | null {
  const normalizedDomain = normalizeDomain(domain);

  if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
    return null;
  }

  try {
    return new URL(href, `https://${normalizedDomain}`).toString();
  } catch {
    return null;
  }
}

function scorePolicyLink(url: string, text: string): number {
  const haystack = `${url} ${text}`.toLowerCase();
  let score = 0;

  if (/return|refund|exchange/.test(haystack)) {
    score += 5;
  }

  if (/shipping|delivery/.test(haystack)) {
    score += 5;
  }

  if (/policy|help|faq|support|customer-service/.test(haystack)) {
    score += 2;
  }

  return score;
}

function extractPolicyLinks(domain: string, html: string): string[] {
  const links: DiscoveredLink[] = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const href = toAbsoluteUrl(domain, match[1]);
    if (!href) {
      continue;
    }

    const label = stripHtml(match[2]);
    const score = scorePolicyLink(href, label);
    if (score > 0) {
      links.push({ href, score });
    }
  }

  return links
    .sort((left, right) => right.score - left.score)
    .map((link) => link.href);
}

async function fetchText(url: string, fetchImpl: FetchLike): Promise<string | null> {
  try {
    const response = await fetchImpl(url, {
      headers: { "user-agent": "returnrate-bot/1.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}

async function discoverPolicyContent(domain: string, fetchImpl: FetchLike): Promise<{
  html: string;
  source: string;
}> {
  const normalizedDomain = normalizeDomain(domain);
  const homeUrl = `https://${normalizedDomain}`;
  const homepageHtml = await fetchText(homeUrl, fetchImpl);

  const candidates = new Set<string>();
  candidates.add(homeUrl);

  if (homepageHtml) {
    for (const url of extractPolicyLinks(normalizedDomain, homepageHtml)) {
      candidates.add(url);
    }
  }

  for (const path of COMMON_POLICY_PATHS) {
    candidates.add(`https://${normalizedDomain}${path}`);
  }

  const pages: Array<{ url: string; html: string }> = [];

  for (const candidate of candidates) {
    const html = candidate === homeUrl && homepageHtml ? homepageHtml : await fetchText(candidate, fetchImpl);
    if (!html) {
      continue;
    }

    pages.push({ url: candidate, html });
    if (pages.length >= 3) {
      break;
    }
  }

  if (pages.length === 0) {
    throw new Error(`Unable to fetch any policy content for ${normalizedDomain}`);
  }

  return {
    html: pages.map((page) => page.html).join("\n"),
    source: pages.map((page) => page.url).join(", "),
  };
}

export function parseBrandPolicyPage(domain: string, html: string, source = "scraped"): BrandScoreRecord {
  const metrics = extractPolicyMetrics(html);
  return buildRecord(domain, metrics, source);
}

export async function scrapeBrand(
  domain: string,
  options: { fetch?: FetchLike } = {},
): Promise<BrandScoreRecord> {
  const fetchImpl = options.fetch ?? fetch;
  const { html, source } = await discoverPolicyContent(domain, fetchImpl);
  return parseBrandPolicyPage(domain, html, source);
}
