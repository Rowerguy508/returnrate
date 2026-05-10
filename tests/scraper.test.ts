import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateOverallScore,
  extractPolicyMetrics,
  parseBrandPolicyPage,
  scrapeBrand,
} from "../src/lib/scraper.ts";

function createMockFetch(pages: Record<string, string>) {
  return async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const body = pages[url];

    if (!body) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(body, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };
}

test("extractPolicyMetrics parses returns, restocking fee, shipping threshold, and speed", () => {
  const metrics = extractPolicyMetrics(`
    <section>
      <p>Items may be returned within 45 days of delivery.</p>
      <p>A 10% restocking fee applies to final sale electronics.</p>
      <p>Free shipping on orders over $60.</p>
      <p>Express shipping is available nationwide.</p>
      <p>Every bag is backed by our lifetime warranty.</p>
      <p>We will match any price from an authorized competitor.</p>
    </section>
  `);

  assert.deepEqual(metrics, {
    return_days: 45,
    restock_fee_pct: 10,
    free_shipping_threshold: 60,
    shipping_speed: "express",
    lifetime_warranty: true,
    price_match_guarantee: true,
  });
});

test("parseBrandPolicyPage maps parsed values into the database record shape", () => {
  const result = parseBrandPolicyPage(
    "nike.com",
    `
      <div>
        <p>You can return eligible items within 60 days.</p>
        <p>No restocking fee.</p>
        <p>Free shipping on orders over $50.</p>
        <p>Standard shipping takes 3-5 business days.</p>
        <p>All products include a limited lifetime warranty.</p>
        <p>Lowest price guarantee on all in-stock items.</p>
      </div>
    `,
    "https://nike.com/returns",
  );

  assert.equal(result.brand_name, "Nike");
  assert.equal(result.domain, "nike.com");
  assert.equal(result.return_days, 60);
  assert.equal(result.restock_fee_pct, 0);
  assert.equal(result.free_shipping_threshold, 50);
  assert.equal(result.shipping_speed, "standard");
  assert.equal(result.lifetime_warranty, true);
  assert.equal(result.price_match_guarantee, true);
  assert.equal(result.cs_response_time, "unknown");
  assert.equal(result.data_source, "https://nike.com/returns");
  assert.match(result.last_updated, /^\d{4}-\d{2}-\d{2}T/);
  assert.match(result.created_at, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(result.overall_score, calculateOverallScore(result));
});

test("scrapeBrand discovers policy pages for Nike", async () => {
  const mockFetch = createMockFetch({
    "https://nike.com": `
      <a href="/help/returns-policy">Returns & Exchanges</a>
      <a href="/shipping-delivery">Shipping</a>
    `,
    "https://nike.com/help/returns-policy": `
      <main>
        <p>Members can return items within 60 days of purchase.</p>
        <p>No restocking fee for returns.</p>
        <p>Your shoes are backed by our lifetime warranty.</p>
        <p>We will match any price offered by approved retailers.</p>
      </main>
    `,
    "https://nike.com/shipping-delivery": `
      <main>
        <p>Free shipping on orders over $50.</p>
        <p>Standard shipping takes 3-5 business days.</p>
      </main>
    `,
  });

  const result = await scrapeBrand("nike.com", { fetch: mockFetch });

  assert.equal(result.domain, "nike.com");
  assert.equal(result.return_days, 60);
  assert.equal(result.restock_fee_pct, 0);
  assert.equal(result.free_shipping_threshold, 50);
  assert.equal(result.shipping_speed, "standard");
  assert.equal(result.lifetime_warranty, true);
  assert.equal(result.price_match_guarantee, true);
  assert.equal(result.overall_score, 100);
});

test("scrapeBrand discovers policy pages for Patagonia", async () => {
  const mockFetch = createMockFetch({
    "https://patagonia.com": `
      <a href="/returns.html">Return Policy</a>
      <a href="/shipping.html">Delivery info</a>
    `,
    "https://patagonia.com/returns.html": `
      <main>
        <p>Returns are accepted within 30 days.</p>
        <p>No restocking fee.</p>
      </main>
    `,
    "https://patagonia.com/shipping.html": `
      <main>
        <p>Free shipping on all orders.</p>
        <p>Next-day delivery is available in select ZIP codes.</p>
      </main>
    `,
  });

  const result = await scrapeBrand("patagonia.com", { fetch: mockFetch });

  assert.equal(result.domain, "patagonia.com");
  assert.equal(result.return_days, 30);
  assert.equal(result.restock_fee_pct, 0);
  assert.equal(result.free_shipping_threshold, 0);
  assert.equal(result.shipping_speed, "next-day");
  assert.equal(result.lifetime_warranty, false);
  assert.equal(result.price_match_guarantee, false);
  assert.equal(result.overall_score, 60);
});

test("scrapeBrand discovers policy pages for Best Buy", async () => {
  const mockFetch = createMockFetch({
    "https://bestbuy.com": `
      <a href="/site/help-topics/return-policy">Return policy</a>
      <a href="/site/shipping-delivery-store-pickup">Shipping & Delivery</a>
    `,
    "https://bestbuy.com/site/help-topics/return-policy": `
      <main>
        <p>You have 15 days to return most items.</p>
        <p>A 15% restocking fee applies to select products.</p>
      </main>
    `,
    "https://bestbuy.com/site/shipping-delivery-store-pickup": `
      <main>
        <p>Free shipping on orders over $35.</p>
        <p>Express shipping is available for many products.</p>
      </main>
    `,
  });

  const result = await scrapeBrand("bestbuy.com", { fetch: mockFetch });

  assert.equal(result.domain, "bestbuy.com");
  assert.equal(result.return_days, 15);
  assert.equal(result.restock_fee_pct, 15);
  assert.equal(result.free_shipping_threshold, 35);
  assert.equal(result.shipping_speed, "express");
  assert.equal(result.lifetime_warranty, false);
  assert.equal(result.price_match_guarantee, false);
  assert.equal(result.overall_score, 22);
});
