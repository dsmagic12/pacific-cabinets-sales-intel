export type CustomerTier = "platinum" | "gold" | "silver" | "prospect";
export type CustomerSegment = "builder" | "remodeler" | "architect" | "dealer";

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  territory: string;
  assignedRepId: string;
  segment: CustomerSegment;
  tier: CustomerTier;
  annualRevenue: number;
  lifetimeRevenue: number;
  preferredStyles: string[];
  preferredFinishes: string[];
  notes: string;
  lastContactDate: string;
  nextScheduledContact: string | null;
  createdAt: string;
}

export type ProjectStatus =
  | "estimating"
  | "ordered"
  | "in_production"
  | "delivered"
  | "complete";
export type ProjectType = "new_construction" | "remodel" | "commercial";

export interface Project {
  id: string;
  customerId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  addressCity: string;
  addressState: string;
  unitCount: number | null;
  estimatedValue: number;
  actualValue: number | null;
  orderIds: string[];
  startDate: string;
  deliveryDate: string | null;
  completionDate: string | null;
  notes: string;
}

export type OrderStatus =
  | "quote"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered";

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  extendedPrice: number;
  style: string;
  finish: string;
  species: string | null;
  customOptions: Record<string, string>;
}

export interface Order {
  id: string;
  customerId: string;
  projectId: string | null;
  orderDate: string;
  deliveryDate: string | null;
  status: OrderStatus;
  repId: string;
  lineItems: OrderLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
}

export interface Rep {
  id: string;
  name: string;
  email: string;
  territory: string;
  region: string;
  managerName: string;
  specialties: string[];
  customerIds: string[];
  ytdRevenue: number;
  ytdQuota: number;
}

export type ProductCategory =
  | "interior_door"
  | "base_cabinet"
  | "wall_cabinet"
  | "vanity_cabinet"
  | "tall_cabinet"
  | "trim"
  | "hardware";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  style: string;
  finish: string;
  species: string | null;
  basePrice: number;
  unit: string;
  description: string;
  leadTimeDays: number;
  inStock: boolean;
  popularWith: CustomerSegment[];
}
