import type { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Building2, Home, Briefcase } from "lucide-react";

interface ProjectTimelineProps {
  projects: Project[];
}

const statusVariants: Record<string, "success" | "warning" | "info" | "secondary" | "danger"> = {
  complete: "success",
  delivered: "info",
  in_production: "warning",
  ordered: "secondary",
  estimating: "danger",
};

const statusLabels: Record<string, string> = {
  complete: "Complete",
  delivered: "Delivered",
  in_production: "In Production",
  ordered: "Ordered",
  estimating: "Estimating",
};

const typeIcons: Record<string, React.ReactNode> = {
  new_construction: <Building2 className="w-4 h-4" />,
  remodel: <Home className="w-4 h-4" />,
  commercial: <Briefcase className="w-4 h-4" />,
};

export default function ProjectTimeline({ projects }: ProjectTimelineProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        No projects on record
      </div>
    );
  }

  const sorted = [...projects].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="space-y-3">
      {sorted.map((project) => (
        <div
          key={project.id}
          className="p-4 bg-white border border-border rounded-lg hover:border-amber/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cream border border-border flex items-center justify-center flex-shrink-0 text-muted">
                {typeIcons[project.type]}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-navy leading-tight">
                  {project.name}
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  {project.addressCity}, {project.addressState}
                  {project.unitCount && ` · ${project.unitCount} units`}
                </p>
              </div>
            </div>
            <Badge variant={statusVariants[project.status] ?? "secondary"}>
              {statusLabels[project.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted">Est. Value</p>
              <p className="text-sm font-semibold text-navy">
                {formatCurrency(project.estimatedValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Start Date</p>
              <p className="text-sm text-navy">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">
                {project.completionDate
                  ? "Completed"
                  : project.deliveryDate
                  ? "Delivery"
                  : "Est. Delivery"}
              </p>
              <p className="text-sm text-navy">
                {project.completionDate
                  ? formatDate(project.completionDate)
                  : project.deliveryDate
                  ? formatDate(project.deliveryDate)
                  : "TBD"}
              </p>
            </div>
          </div>

          {project.notes && (
            <p className="text-xs text-muted mt-2 italic">{project.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
