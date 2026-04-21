import Link from "next/link";
import type { Customer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { Phone, Mail, ArrowRight, Calendar } from "lucide-react";

interface CustomerCardProps {
  customer: Customer;
}

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

export default function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Link href={`/customers/${customer.id}`}>
      <Card className="hover:shadow-md hover:border-amber transition-all duration-200 group cursor-pointer">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {customer.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-navy group-hover:text-amber transition-colors text-sm leading-tight">
                  {customer.name}
                </h3>
                <p className="text-xs text-muted">{customer.contactName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={tierVariants[customer.tier] ?? "default"}>
                {customer.tier}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {segmentLabels[customer.segment]}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-muted">YTD Revenue</p>
              <p className="text-sm font-bold text-navy">
                {formatCurrency(customer.annualRevenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Territory</p>
              <p className="text-sm font-medium text-navy truncate">
                {customer.territory}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {customer.preferredStyles.slice(0, 2).map((style) => (
              <span
                key={style}
                className="text-xs bg-cream border border-border text-navy px-2 py-0.5 rounded-full capitalize"
              >
                {style.replace("_", " ")}
              </span>
            ))}
            {customer.preferredFinishes.slice(0, 1).map((finish) => (
              <span
                key={finish}
                className="text-xs bg-amber/10 border border-amber/20 text-amber-dark px-2 py-0.5 rounded-full capitalize"
              >
                {finish}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted">
              <Calendar className="w-3 h-3" />
              {customer.nextScheduledContact
                ? `Next: ${new Date(customer.nextScheduledContact).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : `Last: ${formatRelativeDate(customer.lastContactDate)}`}
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-amber transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
