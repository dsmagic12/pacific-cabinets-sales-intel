import type { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderTableProps {
  orders: Order[];
}

const statusVariants: Record<string, "success" | "warning" | "info" | "secondary" | "danger"> = {
  delivered: "success",
  shipped: "info",
  in_production: "warning",
  confirmed: "secondary",
  quote: "danger",
};

const statusLabels: Record<string, string> = {
  delivered: "Delivered",
  shipped: "Shipped",
  in_production: "In Production",
  confirmed: "Confirmed",
  quote: "Quote",
};

export default function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">No orders on record</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cream border-b border-border">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">
              Order Date
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">
              Items
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">
              Style / Finish
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">
              Total
            </th>
            <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const topItem = order.lineItems[0];
            const moreCount = order.lineItems.length - 1;
            return (
              <tr key={order.id} className="bg-white hover:bg-cream/50 transition-colors">
                <td className="px-4 py-3 text-navy font-medium">
                  {formatDate(order.orderDate)}
                </td>
                <td className="px-4 py-3 text-navy">
                  <div className="text-sm">{topItem?.productName ?? "—"}</div>
                  {moreCount > 0 && (
                    <div className="text-xs text-muted">+{moreCount} more</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {topItem && (
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-xs bg-cream border border-border text-navy px-2 py-0.5 rounded-full capitalize">
                        {topItem.style.replace("_", " ")}
                      </span>
                      <span className="text-xs bg-amber/10 border border-amber/20 text-amber-dark px-2 py-0.5 rounded-full capitalize">
                        {topItem.finish}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-navy">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={statusVariants[order.status] ?? "secondary"}>
                    {statusLabels[order.status]}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
