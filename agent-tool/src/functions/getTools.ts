import { zodFunction } from "openai/helpers/zod";
import { lookupSales } from "./lookupSales";
import { LookupSalesInput } from "./toolTypes";

export const getTools = async () => {
  const tools = [
    zodFunction({
      name: lookupSales.name,
      parameters: LookupSalesInput,
    }),
  ];
  return tools;
};
