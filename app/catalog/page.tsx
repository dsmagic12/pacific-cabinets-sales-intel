"use client";

import { useState, useMemo } from "react";
import { mockProducts } from "@/lib/data/mock";
import ProductCard from "@/components/catalog/ProductCard";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Package } from "lucide-react";
import type { ProductCategory } from "@/types";

// ── Filter configuration ─────────────────────────────────────────────────────

type CategoryFilter = "all" | "interior_door" | "cabinet" | "trim" | "hardware";

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All Products" },
  { value: "interior_door", label: "Doors" },
  { value: "cabinet", label: "Cabinets" },
  { value: "trim", label: "Trim & Moulding" },
  { value: "hardware", label: "Hardware" },
];

const CABINET_CATEGORIES: ProductCategory[] = [
  "base_cabinet",
  "wall_cabinet",
  "vanity_cabinet",
  "tall_cabinet",
];

const ALL_STYLES = [
  { value: "all", label: "All Styles" },
  { value: "shaker", label: "Shaker" },
  { value: "raised_panel", label: "Raised Panel" },
  { value: "inset", label: "Inset" },
  { value: "flat_panel", label: "Flat Panel" },
  { value: "craftsman", label: "Craftsman" },
  { value: "thermofoil", label: "Thermofoil" },
  { value: "traditional", label: "Traditional" },
  { value: "contemporary", label: "Contemporary" },
];

const ALL_FINISHES = [
  { value: "all", label: "All Finishes" },
  { value: "painted", label: "Painted" },
  { value: "stained", label: "Stained" },
  { value: "thermofoil", label: "Thermofoil" },
  { value: "brushed_nickel", label: "Brushed Nickel" },
  { value: "oil_rubbed_bronze", label: "Oil-Rubbed Bronze" },
  { value: "matte_black", label: "Matte Black" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [style, setStyle] = useState("all");
  const [finish, setFinish] = useState("all");

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      // Category
      if (category === "interior_door" && p.category !== "interior_door") return false;
      if (category === "cabinet" && !CABINET_CATEGORIES.includes(p.category)) return false;
      if (category === "trim" && p.category !== "trim") return false;
      if (category === "hardware" && p.category !== "hardware") return false;

      // Style
      if (style !== "all" && p.style !== style) return false;

      // Finish
      if (finish !== "all" && p.finish !== finish) return false;

      // Search
      if (query) {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.species?.toLowerCase().includes(q) ?? false)
        );
      }

      return true;
    });
  }, [query, category, style, finish]);

  // Only show style/finish options that are present in the current category slice
  const visibleStyles = useMemo(() => {
    const presentStyles = new Set(
      mockProducts
        .filter((p) => {
          if (category === "interior_door") return p.category === "interior_door";
          if (category === "cabinet") return CABINET_CATEGORIES.includes(p.category);
          if (category === "trim") return p.category === "trim";
          if (category === "hardware") return p.category === "hardware";
          return true;
        })
        .map((p) => p.style)
    );
    return ALL_STYLES.filter((s) => s.value === "all" || presentStyles.has(s.value));
  }, [category]);

  const visibleFinishes = useMemo(() => {
    const presentFinishes = new Set(
      mockProducts
        .filter((p) => {
          if (category === "interior_door") return p.category === "interior_door";
          if (category === "cabinet") return CABINET_CATEGORIES.includes(p.category);
          if (category === "trim") return p.category === "trim";
          if (category === "hardware") return p.category === "hardware";
          return true;
        })
        .map((p) => p.finish)
    );
    return ALL_FINISHES.filter((f) => f.value === "all" || presentFinishes.has(f.value));
  }, [category]);

  const handleCategoryChange = (val: CategoryFilter) => {
    setCategory(val);
    setStyle("all");
    setFinish("all");
  };

  const inStockCount = filtered.filter((p) => p.inStock).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber" />
          Product Catalog
        </h1>
        <p className="text-muted mt-1">
          {mockProducts.length} products · Frontier Door &amp; Cabinet
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, SKUs, species..."
          className="pl-9"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-3">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleCategoryChange(tab.value)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors font-medium ${
              category === tab.value
                ? "bg-navy text-white border-navy"
                : "bg-white text-navy border-border hover:border-navy"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Style + Finish filters */}
      <div className="space-y-2 mb-5">
        {visibleStyles.length > 1 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted">Style:</span>
            {visibleStyles.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  style === s.value
                    ? "bg-amber text-white border-amber"
                    : "bg-white text-navy border-border hover:border-amber"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
        {visibleFinishes.length > 1 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted">Finish:</span>
            {visibleFinishes.map((f) => (
              <button
                key={f.value}
                onClick={() => setFinish(f.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  finish === f.value
                    ? "bg-amber text-white border-amber"
                    : "bg-white text-navy border-border hover:border-amber"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="text-sm text-muted mb-4">
        Showing {filtered.length} of {mockProducts.length} products
        {filtered.length > 0 && (
          <span className="ml-2 text-success font-medium">· {inStockCount} in stock</span>
        )}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-navy font-medium mb-1">No products match your filters</p>
          <p className="text-sm text-muted">Try adjusting the style, finish, or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
