import Link from "next/link";
import { mockCustomers, mockProjects, mockReps } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import TerritoryDigest from "@/components/intelligence/TerritoryDigest";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FolderOpen,
  Target,
  ArrowRight,
  Building2,
  Home,
  Briefcase,
} from "lucide-react";

// ── Data derivations ─────────────────────────────────────────────────────────

type AccountHealth = "healthy" | "watch" | "at_risk";

function getAccountHealth(lastContactDate: string, nextScheduledContact: string | null): AccountHealth {
  const today = new Date();
  const daysSince = Math.floor(
    (today.getTime() - new Date(lastContactDate).getTime()) / 86400000
  );
  const overdueBy =
    nextScheduledContact && nextScheduledContact < today.toISOString().slice(0, 10)
      ? Math.floor(
          (today.getTime() - new Date(nextScheduledContact).getTime()) / 86400000
        )
      : 0;

  if (overdueBy > 14 || daysSince > 35) return "at_risk";
  if (overdueBy > 0 || daysSince > 21) return "watch";
  return "healthy";
}

const healthConfig: Record<AccountHealth, { label: string; dot: string; badge: "success" | "warning" | "danger" }> = {
  healthy: { label: "Healthy", dot: "bg-success", badge: "success" },
  watch: { label: "Watch", dot: "bg-warning", badge: "warning" },
  at_risk: { label: "At Risk", dot: "bg-danger", badge: "danger" },
};

const projectTypeIcons: Record<string, React.ReactNode> = {
  new_construction: <Building2 className="w-3.5 h-3.5" />,
  remodel: <Home className="w-3.5 h-3.5" />,
  commercial: <Briefcase className="w-3.5 h-3.5" />,
};

const projectStatusVariants: Record<string, "success" | "warning" | "info" | "secondary" | "danger"> = {
  estimating: "danger",
  ordered: "secondary",
  in_production: "warning",
  delivered: "info",
  complete: "success",
};

const projectStatusLabels: Record<string, string> = {
  estimating: "Estimating",
  ordered: "Ordered",
  in_production: "In Production",
  delivered: "Delivered",
  complete: "Complete",
};

const tierVariants: Record<string, "platinum" | "gold" | "silver" | "prospect"> = {
  platinum: "platinum",
  gold: "gold",
  silver: "silver",
  prospect: "prospect",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // KPIs
  const totalRevenue = mockReps.reduce((s, r) => s + r.ytdRevenue, 0);
  const totalQuota = mockReps.reduce((s, r) => s + r.ytdQuota, 0);
  const quotaAttainment = Math.round((totalRevenue / totalQuota) * 100);

  const pipelineProjects = mockProjects.filter((p) =>
    ["estimating", "ordered"].includes(p.status)
  );
  const pipelineValue = pipelineProjects.reduce((s, p) => s + p.estimatedValue, 0);

  const overdueCustomers = mockCustomers.filter(
    (c) => c.nextScheduledContact && c.nextScheduledContact < todayStr
  );

  const activeProjects = mockProjects.filter((p) => p.status !== "complete");

  // Account health
  const accountsWithHealth = mockCustomers.map((c) => ({
    customer: c,
    health: getAccountHealth(c.lastContactDate, c.nextScheduledContact),
    daysSince: Math.floor(
      (today.getTime() - new Date(c.lastContactDate).getTime()) / 86400000
    ),
    overdueBy:
      c.nextScheduledContact && c.nextScheduledContact < todayStr
        ? Math.floor(
            (today.getTime() - new Date(c.nextScheduledContact).getTime()) / 86400000
          )
        : 0,
  }));

  // Pipeline: open estimates + ordered, sorted by value desc
  const pipelineWithCustomer = pipelineProjects
    .map((p) => ({
      project: p,
      customer: mockCustomers.find((c) => c.id === p.customerId),
    }))
    .sort((a, b) => b.project.estimatedValue - a.project.estimatedValue);

  // In-production projects (upcoming deliveries)
  const inProduction = mockProjects
    .filter((p) => p.status === "in_production")
    .map((p) => ({
      project: p,
      customer: mockCustomers.find((c) => c.id === p.customerId),
    }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber" />
          Market Intelligence
        </h1>
        <p className="text-muted mt-1">
          Pacific Northwest Territory ·{" "}
          {today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Territory YTD</span>
              <DollarSign className="w-4 h-4 text-amber" />
            </div>
            <p className="text-2xl font-bold text-navy">{formatCurrency(totalRevenue)}</p>
            <div className="mt-2">
              <Progress value={quotaAttainment} className="h-1.5" />
              <p className="text-xs text-muted mt-1">{quotaAttainment}% of {formatCurrency(totalQuota)} quota</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Open Pipeline</span>
              <Target className="w-4 h-4 text-amber" />
            </div>
            <p className="text-2xl font-bold text-navy">{formatCurrency(pipelineValue)}</p>
            <p className="text-xs text-muted mt-1">{pipelineProjects.length} open estimates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Overdue Contacts</span>
              <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
            <p className="text-2xl font-bold text-danger">{overdueCustomers.length}</p>
            <p className="text-xs text-muted mt-1">of {mockCustomers.length} accounts need outreach</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Active Projects</span>
              <FolderOpen className="w-4 h-4 text-amber" />
            </div>
            <p className="text-2xl font-bold text-navy">{activeProjects.length}</p>
            <p className="text-xs text-muted mt-1">{inProduction.length} in production</p>
          </CardContent>
        </Card>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Digest — left */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <TerritoryDigest />
            </CardContent>
          </Card>
        </div>

        {/* Right column — account health + pipeline */}
        <div className="lg:col-span-2 space-y-4">

          {/* Account Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber" />
                  Account Health
                </span>
                <Link href="/customers" className="text-xs text-muted hover:text-navy flex items-center gap-1 transition-colors">
                  All accounts <ArrowRight className="w-3 h-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {accountsWithHealth.map(({ customer, health, daysSince, overdueBy }) => {
                  const cfg = healthConfig[health];
                  return (
                    <Link
                      key={customer.id}
                      href={`/customers/${customer.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream transition-colors group"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy group-hover:text-amber transition-colors truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted">
                          {overdueBy > 0
                            ? `Contact overdue ${overdueBy}d`
                            : `Last contact ${formatRelativeDate(customer.lastContactDate)}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge variant={tierVariants[customer.tier] ?? "default"}>
                          {customer.tier}
                        </Badge>
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Pipeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-amber" />
                Open Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {pipelineWithCustomer.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No open estimates</p>
              ) : (
                <div className="space-y-3">
                  {pipelineWithCustomer.map(({ project, customer }) => (
                    <div key={project.id}>
                      <div className="flex items-start gap-2">
                        <span className="text-muted mt-0.5 flex-shrink-0">
                          {projectTypeIcons[project.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy leading-tight">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted truncate">{customer?.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-bold text-navy">
                            {formatCurrency(project.estimatedValue)}
                          </p>
                          <Badge variant={projectStatusVariants[project.status] ?? "secondary"}>
                            {projectStatusLabels[project.status]}
                          </Badge>
                        </div>
                      </div>
                      {project.notes && (
                        <p className="text-xs text-muted mt-1 ml-5 italic line-clamp-1">
                          {project.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {inProduction.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                    In Production
                  </p>
                  <div className="space-y-3">
                    {inProduction.map(({ project, customer }) => (
                      <div key={project.id} className="flex items-start gap-2">
                        <span className="text-muted mt-0.5 flex-shrink-0">
                          {projectTypeIcons[project.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy leading-tight">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted">{customer?.name}</p>
                          {project.deliveryDate && (
                            <p className="text-xs text-amber font-medium mt-0.5">
                              Delivery {new Date(project.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-navy flex-shrink-0">
                          {formatCurrency(project.estimatedValue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
