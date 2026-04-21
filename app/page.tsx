import Link from "next/link";
import { getDashboardStats, getCustomer, mockReps } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Calendar,
  ArrowRight,
  Target,
} from "lucide-react";
import { formatCurrency, formatRelativeDate, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const rep = mockReps[0];

  const tierColors: Record<string, "platinum" | "gold" | "silver" | "prospect"> = {
    platinum: "platinum",
    gold: "gold",
    silver: "silver",
    prospect: "prospect",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Good morning, Jordan</h1>
        <p className="text-muted mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          {" · "}Pacific Northwest Territory
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted font-medium">YTD Revenue</span>
              <DollarSign className="w-4 h-4 text-amber" />
            </div>
            <div className="text-2xl font-bold text-navy">
              {formatCurrency(stats.repsRevenue)}
            </div>
            <div className="mt-2">
              <Progress value={stats.quotaAttainment} className="h-1.5" />
              <span className="text-xs text-muted mt-1 block">
                {stats.quotaAttainment}% of {formatCurrency(stats.repsQuota)} quota
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted font-medium">Open Estimates</span>
              <FileText className="w-4 h-4 text-amber" />
            </div>
            <div className="text-2xl font-bold text-navy">{stats.openEstimates}</div>
            <p className="text-xs text-muted mt-1">Projects in estimating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted font-medium">My Customers</span>
              <Users className="w-4 h-4 text-amber" />
            </div>
            <div className="text-2xl font-bold text-navy">{stats.customerCount}</div>
            <p className="text-xs text-muted mt-1">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted font-medium">Quota Attainment</span>
              <Target className="w-4 h-4 text-amber" />
            </div>
            <div className="text-2xl font-bold text-navy">{stats.quotaAttainment}%</div>
            <p className="text-xs text-muted mt-1">
              {stats.quotaAttainment >= 80 ? "On track" : "Needs attention"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Contacts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber" />
                Upcoming Contacts
              </CardTitle>
              <Link href="/customers">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.upcomingContacts.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                No upcoming contacts scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingContacts.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-cream transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-navy group-hover:text-amber transition-colors">
                          {customer.name}
                        </div>
                        <div className="text-xs text-muted">
                          {customer.contactName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={tierColors[customer.tier] ?? "default"} className="mb-1">
                        {customer.tier}
                      </Badge>
                      <div className="text-xs text-muted">
                        {customer.nextScheduledContact
                          ? formatDate(customer.nextScheduledContact)
                          : ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted mb-4">
                Jump into a customer to generate an AI-powered pre-call brief before your next interaction.
              </p>
              <Link href="/customers">
                <Button variant="primary" className="w-full justify-between">
                  View All Customers
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link href="/catalog">
                  <Button variant="outline" className="w-full text-xs">
                    Product Catalog
                  </Button>
                </Link>
                <Link href="/intelligence">
                  <Button variant="outline" className="w-full text-xs">
                    Market Intel
                  </Button>
                </Link>
              </div>

              {/* Rep quota summary */}
              <div className="mt-4 p-3 bg-cream rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-navy">Your Q2 Progress</span>
                  <span className="text-xs font-bold text-amber">{stats.quotaAttainment}%</span>
                </div>
                <Progress value={stats.quotaAttainment} />
                <div className="flex justify-between mt-1.5 text-xs text-muted">
                  <span>{formatCurrency(rep.ytdRevenue)} closed</span>
                  <span>{formatCurrency(rep.ytdQuota)} quota</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
