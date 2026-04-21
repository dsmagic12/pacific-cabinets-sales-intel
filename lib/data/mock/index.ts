import { mockCustomers } from "./customers";
import { mockProjects } from "./projects";
import { mockOrders } from "./orders";
import { mockReps } from "./reps";
import { mockProducts } from "./catalog";
import type { Customer, Project, Order, Rep, Product, ProductCategory } from "@/types";

export { mockCustomers, mockProjects, mockOrders, mockReps, mockProducts };

export function getCustomers(query?: string): Customer[] {
  if (!query) return mockCustomers;
  const q = query.toLowerCase();
  return mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q) ||
      c.territory.toLowerCase().includes(q)
  );
}

export function getCustomer(id: string): Customer | undefined {
  return mockCustomers.find((c) => c.id === id);
}

export function getProjects(customerId: string): Project[] {
  return mockProjects.filter((p) => p.customerId === customerId);
}

export function getOrders(customerId: string): Order[] {
  return mockOrders
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}

export function getRecentOrders(customerId: string, n = 10): Order[] {
  return getOrders(customerId).slice(0, n);
}

export function getRep(id: string): Rep | undefined {
  return mockReps.find((r) => r.id === id);
}

export function getMonthlyRevenue(
  customerId: string,
  months = 12
): { month: string; revenue: number }[] {
  const orders = getOrders(customerId);
  const now = new Date();
  const result: { month: string; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7); // "2025-04"
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const revenue = orders
      .filter((o) => o.orderDate.startsWith(monthKey))
      .reduce((sum, o) => sum + o.total, 0);
    result.push({ month: label, revenue });
  }

  return result;
}

export function getCustomerStats(customerId: string) {
  const orders = getOrders(customerId);
  const projects = getProjects(customerId);

  const ytdOrders = orders.filter(
    (o) => new Date(o.orderDate).getFullYear() === new Date().getFullYear()
  );
  const ytdRevenue = ytdOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue =
    orders.length > 0
      ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length
      : 0;
  const activeProjects = projects.filter(
    (p) => !["complete"].includes(p.status)
  ).length;

  return {
    totalOrders: orders.length,
    ytdRevenue,
    avgOrderValue,
    activeProjects,
    projectCount: projects.length,
  };
}

export function getProducts(opts?: {
  category?: ProductCategory | "cabinet";
  style?: string;
  finish?: string;
  query?: string;
}): Product[] {
  let results = mockProducts;

  if (opts?.category && opts.category !== "cabinet") {
    results = results.filter((p) => p.category === opts.category);
  } else if (opts?.category === "cabinet") {
    const cabinetCategories: ProductCategory[] = [
      "base_cabinet",
      "wall_cabinet",
      "vanity_cabinet",
      "tall_cabinet",
    ];
    results = results.filter((p) => cabinetCategories.includes(p.category));
  }

  if (opts?.style) {
    results = results.filter((p) => p.style === opts.style);
  }

  if (opts?.finish) {
    results = results.filter((p) => p.finish === opts.finish);
  }

  if (opts?.query) {
    const q = opts.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.species && p.species.toLowerCase().includes(q))
    );
  }

  return results;
}

export function getDashboardStats() {
  const totalYtdRevenue = mockCustomers.reduce((sum, c) => sum + c.annualRevenue, 0);
  const repsQuota = mockReps.reduce((sum, r) => sum + r.ytdQuota, 0);
  const repsRevenue = mockReps.reduce((sum, r) => sum + r.ytdRevenue, 0);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingContacts = mockCustomers.filter(
    (c) => c.nextScheduledContact && c.nextScheduledContact >= today
  ).sort((a, b) =>
    (a.nextScheduledContact ?? "").localeCompare(b.nextScheduledContact ?? "")
  );

  const openEstimates = mockProjects.filter(
    (p) => p.status === "estimating"
  ).length;

  return {
    totalYtdRevenue,
    repsQuota,
    repsRevenue,
    quotaAttainment: Math.round((repsRevenue / repsQuota) * 100),
    upcomingContacts: upcomingContacts.slice(0, 3),
    openEstimates,
    customerCount: mockCustomers.length,
  };
}
