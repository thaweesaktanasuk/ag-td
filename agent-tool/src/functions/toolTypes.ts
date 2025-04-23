import { z } from "zod";

export const LookupSalesInput = z.object({
  category: z.enum(["snowboard", "apparel", "boots", "accessories", "any"]),
});

export type LookupSalesInputType = z.infer<typeof LookupSalesInput>;
