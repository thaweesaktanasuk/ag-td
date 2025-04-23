import { log } from "@restackio/ai/function";

type SalesItem = {
  item_id: number;
  type: string;
  name: string;
  retail_price_usd: number;
  sale_price_usd: number;
  sale_discount_pct: number;
};

export const lookupSales = async (): Promise<string> => {
  try {
    log.info("lookupSales function started");

    const items: SalesItem[] = [
      {
        item_id: 101,
        type: "snowboard",
        name: "Alpine Blade",
        retail_price_usd: 450,
        sale_price_usd: 360,
        sale_discount_pct: 20,
      },
      {
        item_id: 102,
        type: "snowboard",
        name: "Peak Bomber",
        retail_price_usd: 499,
        sale_price_usd: 374,
        sale_discount_pct: 25,
      },
      {
        item_id: 201,
        type: "apparel",
        name: "Thermal Jacket",
        retail_price_usd: 120,
        sale_price_usd: 84,
        sale_discount_pct: 30,
      },
      {
        item_id: 202,
        type: "apparel",
        name: "Insulated Pants",
        retail_price_usd: 150,
        sale_price_usd: 112,
        sale_discount_pct: 25,
      },
      {
        item_id: 301,
        type: "boots",
        name: "Glacier Grip",
        retail_price_usd: 250,
        sale_price_usd: 200,
        sale_discount_pct: 20,
      },
      {
        item_id: 302,
        type: "boots",
        name: "Summit Steps",
        retail_price_usd: 300,
        sale_price_usd: 210,
        sale_discount_pct: 30,
      },
      {
        item_id: 401,
        type: "accessories",
        name: "Goggles",
        retail_price_usd: 80,
        sale_price_usd: 60,
        sale_discount_pct: 25,
      },
      {
        item_id: 402,
        type: "accessories",
        name: "Warm Gloves",
        retail_price_usd: 60,
        sale_price_usd: 48,
        sale_discount_pct: 20,
      },
    ];

    return JSON.stringify(items);
  } catch (e) {
    log.error("lookupSales function failed", { error: e });
    throw e;
  }
};
