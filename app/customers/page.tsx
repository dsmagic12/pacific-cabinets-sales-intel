"use client";

import { useState } from "react";
import { getCustomers } from "@/lib/data/mock";
import CustomerCard from "@/components/customers/CustomerCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";

const SEGMENTS = ["All", "builder", "remodeler", "architect", "dealer"] as const;
const TIERS = ["All", "platinum", "gold", "silver", "prospect"] as const;

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<string>("All");
  const [tier, setTier] = useState<string>("All");

  const allCustomers = getCustomers();

  const filtered = allCustomers.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.contactName.toLowerCase().includes(query.toLowerCase());
    const matchesSegment = segment === "All" || c.segment === segment;
    const matchesTier = tier === "All" || c.tier === tier;
    return matchesQuery && matchesSegment && matchesTier;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Users className="w-6 h-6 text-amber" />
          My Customers
        </h1>
        <p className="text-muted mt-1">
          {allCustomers.length} accounts · Pacific Northwest Territory
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers or contacts..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-muted self-center">Segment:</span>
          {SEGMENTS.map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                segment === s
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-border hover:border-navy"
              }`}
            >
              {s}
            </button>
          ))}
          <span className="text-xs text-muted self-center ml-2">Tier:</span>
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                tier === t
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-border hover:border-navy"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted mb-4">
        Showing {filtered.length} of {allCustomers.length} customers
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted">No customers match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
