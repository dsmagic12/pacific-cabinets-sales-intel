import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";

export default function CustomerNotFound() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Customers
      </Link>

      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-cream border border-border flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted" />
        </div>
        <h1 className="text-xl font-bold text-navy mb-2">Customer not found</h1>
        <p className="text-sm text-muted mb-6">
          This customer doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors"
        >
          <Users className="w-4 h-4" />
          View all customers
        </Link>
      </div>
    </div>
  );
}
