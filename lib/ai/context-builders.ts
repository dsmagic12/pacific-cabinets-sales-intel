import type { Customer, Project, Order, Rep } from "@/types";
import { mockCustomers, mockProjects, mockReps } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";

export function buildBriefContext(
  customer: Customer,
  projects: Project[],
  recentOrders: Order[],
  rep: Rep | undefined
): string {
  const activeProjects = projects.filter((p) => p.status !== "complete");
  const completedProjects = projects.filter((p) => p.status === "complete");

  const orderSummary = recentOrders
    .slice(0, 10)
    .map((o) => {
      const topItem = o.lineItems[0];
      const styleFinish = topItem
        ? `${topItem.style} ${topItem.finish}`
        : "various";
      return `  - Order ${o.id} (${o.orderDate}): ${formatCurrency(o.total)} | ${o.status} | ${styleFinish}`;
    })
    .join("\n");

  const projectSummary = projects
    .slice(0, 8)
    .map(
      (p) =>
        `  - "${p.name}" in ${p.addressCity}, ${p.addressState} | Status: ${p.status} | Est. Value: ${formatCurrency(p.estimatedValue)}${p.unitCount ? ` | ${p.unitCount} units` : ""}`
    )
    .join("\n");

  const styleFinishTally: Record<string, number> = {};
  recentOrders.forEach((o) =>
    o.lineItems.forEach((li) => {
      const key = `${li.style}/${li.finish}`;
      styleFinishTally[key] = (styleFinishTally[key] || 0) + li.quantity;
    })
  );
  const topStylesFinishes = Object.entries(styleFinishTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `  - ${k}: ${v} units`)
    .join("\n");

  return `<customer_profile>
  <name>${customer.name}</name>
  <contact_name>${customer.contactName}</contact_name>
  <contact_email>${customer.contactEmail}</contact_email>
  <segment>${customer.segment}</segment>
  <tier>${customer.tier}</tier>
  <territory>${customer.territory}</territory>
  <annual_revenue_ytd>${formatCurrency(customer.annualRevenue)}</annual_revenue_ytd>
  <lifetime_revenue>${formatCurrency(customer.lifetimeRevenue)}</lifetime_revenue>
  <preferred_styles>${customer.preferredStyles.join(", ")}</preferred_styles>
  <preferred_finishes>${customer.preferredFinishes.join(", ")}</preferred_finishes>
  <last_contact>${customer.lastContactDate}</last_contact>
  <next_scheduled_contact>${customer.nextScheduledContact ?? "Not scheduled"}</next_scheduled_contact>
  <rep_notes>${customer.notes}</rep_notes>
</customer_profile>

<project_history total="${projects.length}" active="${activeProjects.length}" complete="${completedProjects.length}">
${projectSummary || "  No projects on record"}
</project_history>

<recent_orders count="${Math.min(recentOrders.length, 10)}">
${orderSummary || "  No orders on record"}
</recent_orders>

<style_and_finish_patterns>
${topStylesFinishes || "  No pattern data available"}
</style_and_finish_patterns>

<rep_context>
  <rep_name>${rep?.name ?? "Unknown"}</rep_name>
  <rep_territory>${rep?.territory ?? "Unknown"}</rep_territory>
  <rep_specialties>${rep?.specialties.join(", ") ?? "N/A"}</rep_specialties>
</rep_context>`;
}

export function buildTerritoryContext(): string {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const totalYtdRevenue = mockCustomers.reduce((s, c) => s + c.annualRevenue, 0);
  const totalQuota = mockReps.reduce((s, r) => s + r.ytdQuota, 0);
  const totalRepRevenue = mockReps.reduce((s, r) => s + r.ytdRevenue, 0);
  const quotaAttainment = Math.round((totalRepRevenue / totalQuota) * 100);

  const pipelineProjects = mockProjects.filter((p) =>
    ["estimating", "ordered"].includes(p.status)
  );
  const pipelineValue = pipelineProjects.reduce((s, p) => s + p.estimatedValue, 0);

  const activeProjects = mockProjects.filter((p) => p.status !== "complete");

  const repSummary = mockReps
    .map(
      (r) =>
        `  <rep name="${r.name}" specialties="${r.specialties.join(", ")}" ` +
        `ytd_revenue="${formatCurrency(r.ytdRevenue)}" quota="${formatCurrency(r.ytdQuota)}" ` +
        `attainment="${Math.round((r.ytdRevenue / r.ytdQuota) * 100)}%" />`
    )
    .join("\n");

  const accountSummaries = mockCustomers
    .map((c) => {
      const lastContact = new Date(c.lastContactDate);
      const daysSince = Math.floor(
        (today.getTime() - lastContact.getTime()) / 86400000
      );
      const overdueBy =
        c.nextScheduledContact && c.nextScheduledContact < todayStr
          ? Math.floor(
              (today.getTime() - new Date(c.nextScheduledContact).getTime()) /
                86400000
            )
          : 0;

      const customerProjects = mockProjects.filter(
        (p) => p.customerId === c.id && p.status !== "complete"
      );
      const projectSummary = customerProjects
        .map((p) => `${p.name} (${p.status}, ${formatCurrency(p.estimatedValue)})`)
        .join("; ");

      return `  <account name="${c.name}" tier="${c.tier}" segment="${c.segment}"
    ytd_revenue="${formatCurrency(c.annualRevenue)}"
    last_contact="${c.lastContactDate}" days_since_contact="${daysSince}"
    scheduled_contact="${c.nextScheduledContact ?? "none"}" overdue_days="${overdueBy}"
    active_projects="${projectSummary || "none"}"
    notes="${c.notes}" />`;
    })
    .join("\n");

  const pipelineSummary = pipelineProjects
    .map((p) => {
      const customer = mockCustomers.find((c) => c.id === p.customerId);
      return `  <project name="${p.name}" customer="${customer?.name ?? "Unknown"}"
    status="${p.status}" value="${formatCurrency(p.estimatedValue)}"
    city="${p.addressCity}, ${p.addressState}"
    start_date="${p.startDate}" notes="${p.notes}" />`;
    })
    .join("\n");

  const inProductionSummary = activeProjects
    .filter((p) => p.status === "in_production")
    .map((p) => {
      const customer = mockCustomers.find((c) => c.id === p.customerId);
      return `  <project name="${p.name}" customer="${customer?.name ?? "Unknown"}"
    delivery="${p.deliveryDate ?? "TBD"}" value="${formatCurrency(p.estimatedValue)}" />`;
    })
    .join("\n");

  return `<territory_context date="${todayStr}">

<overview>
  <name>Pacific Northwest</name>
  <ytd_revenue>${formatCurrency(totalYtdRevenue)}</ytd_revenue>
  <combined_quota>${formatCurrency(totalQuota)}</combined_quota>
  <quota_attainment>${quotaAttainment}%</quota_attainment>
  <pipeline_value>${formatCurrency(pipelineValue)}</pipeline_value>
  <active_projects>${activeProjects.length}</active_projects>
</overview>

<reps>
${repSummary}
</reps>

<accounts>
${accountSummaries}
</accounts>

<pipeline_open>
${pipelineSummary || "  None"}
</pipeline_open>

<in_production>
${inProductionSummary || "  None"}
</in_production>

</territory_context>`;
}
