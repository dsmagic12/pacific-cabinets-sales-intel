import { getCustomer, getProjects, getRecentOrders, getCustomerStats, getRep } from "@/lib/data/mock";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const customer = getCustomer(id);

  if (!customer) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  const projects = getProjects(id);
  const recentOrders = getRecentOrders(id, 20);
  const stats = getCustomerStats(id);
  const rep = getRep(customer.assignedRepId);

  return Response.json({ customer, projects, recentOrders, stats, rep });
}
