import { getCustomers } from "@/lib/data/mock";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const customers = getCustomers(q);
  return Response.json(customers);
}
