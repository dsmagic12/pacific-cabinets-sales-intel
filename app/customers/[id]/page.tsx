import { notFound } from "next/navigation";
import { getCustomer, getProjects, getOrders, getCustomerStats, getRep } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BriefPanel from "@/components/brief/BriefPanel";
import ProjectTimeline from "@/components/history/ProjectTimeline";
import OrderTable from "@/components/history/OrderTable";
import RevenueChart from "@/components/history/RevenueChart";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  TrendingUp,
  ShoppingCart,
  FolderOpen,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

const tierVariants: Record<string, "platinum" | "gold" | "silver" | "prospect"> = {
  platinum: "platinum",
  gold: "gold",
  silver: "silver",
  prospect: "prospect",
};

const segmentLabels: Record<string, string> = {
  builder: "Builder",
  remodeler: "Remodeler",
  architect: "Architect",
  dealer: "Dealer",
};

export default async function CustomerHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getCustomer(id);

  if (!customer) notFound();

  const projects = getProjects(id);
  const orders = getOrders(id);
  const stats = getCustomerStats(id);
  const rep = getRep(customer.assignedRepId);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back nav */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: Profile */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h1 className="font-bold text-navy text-lg leading-tight">
                      {customer.name}
                    </h1>
                    <p className="text-sm text-muted">{customer.contactName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant={tierVariants[customer.tier] ?? "default"}>
                    {customer.tier}
                  </Badge>
                  <Badge variant="secondary">
                    {segmentLabels[customer.segment]}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <a
                    href={`mailto:${customer.contactEmail}`}
                    className="hover:text-amber transition-colors truncate"
                  >
                    {customer.contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <a
                    href={`tel:${customer.contactPhone}`}
                    className="hover:text-amber transition-colors"
                  >
                    {customer.contactPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{customer.territory}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="text-xs text-muted uppercase tracking-wide font-semibold mb-2">
                  Preferences
                </div>
                <div>
                  <span className="text-xs text-muted">Styles: </span>
                  <span className="text-xs text-navy">
                    {customer.preferredStyles.map((s) => s.replace("_", " ")).join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted">Finishes: </span>
                  <span className="text-xs text-navy">
                    {customer.preferredFinishes.join(", ")}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1.5 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Last Contact</span>
                  <span className="text-navy font-medium">
                    {formatRelativeDate(customer.lastContactDate)}
                  </span>
                </div>
                {customer.nextScheduledContact && (
                  <div className="flex justify-between">
                    <span>Next Contact</span>
                    <span className="text-amber font-medium">
                      {formatDate(customer.nextScheduledContact)}
                    </span>
                  </div>
                )}
                {rep && (
                  <div className="flex justify-between">
                    <span>Rep</span>
                    <span className="text-navy font-medium">{rep.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Customer Since</span>
                  <span className="text-navy font-medium">
                    {new Date(customer.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber" />
                  <span className="text-xs text-muted">YTD Revenue</span>
                </div>
                <p className="text-lg font-bold text-navy">
                  {formatCurrency(customer.annualRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber" />
                  <span className="text-xs text-muted">Lifetime</span>
                </div>
                <p className="text-lg font-bold text-navy">
                  {formatCurrency(customer.lifetimeRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-amber" />
                  <span className="text-xs text-muted">Avg Order</span>
                </div>
                <p className="text-lg font-bold text-navy">
                  {formatCurrency(stats.avgOrderValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="w-3.5 h-3.5 text-amber" />
                  <span className="text-xs text-muted">Projects</span>
                </div>
                <p className="text-lg font-bold text-navy">
                  {stats.projectCount}
                  <span className="text-xs text-muted font-normal ml-1">
                    ({stats.activeProjects} active)
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rep Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted leading-relaxed">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="brief">
            <TabsList className="w-full justify-start mb-0">
              <TabsTrigger value="brief">AI Brief</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="brief">
              <Card>
                <CardContent className="pt-6">
                  <BriefPanel customerId={customer.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber" />
                      12-Month Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RevenueChart customerId={customer.id} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber" />
                      Order History ({orders.length} orders)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderTable orders={orders} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber" />
                    Projects ({projects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectTimeline projects={projects} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
