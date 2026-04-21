import type { Product, ProductCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DoorClosed, LayoutGrid, Ruler, Wrench, Clock, CheckCircle2, XCircle } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const categoryIcons: Record<ProductCategory, React.ReactNode> = {
  interior_door: <DoorClosed className="w-4 h-4" />,
  base_cabinet: <LayoutGrid className="w-4 h-4" />,
  wall_cabinet: <LayoutGrid className="w-4 h-4" />,
  vanity_cabinet: <LayoutGrid className="w-4 h-4" />,
  tall_cabinet: <LayoutGrid className="w-4 h-4" />,
  trim: <Ruler className="w-4 h-4" />,
  hardware: <Wrench className="w-4 h-4" />,
};

const categoryLabels: Record<ProductCategory, string> = {
  interior_door: "Door",
  base_cabinet: "Base Cabinet",
  wall_cabinet: "Wall Cabinet",
  vanity_cabinet: "Vanity",
  tall_cabinet: "Tall Cabinet",
  trim: "Trim",
  hardware: "Hardware",
};

const finishLabels: Record<string, string> = {
  painted: "Painted",
  stained: "Stained",
  thermofoil: "Thermofoil",
  laminate: "Laminate",
  acrylic: "Acrylic",
  brushed_nickel: "Brushed Nickel",
  oil_rubbed_bronze: "Oil-Rubbed Bronze",
  matte_black: "Matte Black",
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="hover:shadow-md hover:border-amber transition-all duration-200 flex flex-col">
      <CardContent className="pt-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-cream border border-border flex items-center justify-center flex-shrink-0 text-muted">
            {categoryIcons[product.category]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-navy text-sm leading-tight">{product.name}</h3>
            <p className="text-xs text-muted font-mono mt-0.5">{product.sku}</p>
          </div>
          <Badge variant={product.inStock ? "success" : "danger"} className="flex-shrink-0 flex items-center gap-1">
            {product.inStock ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-xs bg-navy/10 border border-navy/20 text-navy px-2 py-0.5 rounded-full capitalize">
            {categoryLabels[product.category]}
          </span>
          <span className="text-xs bg-cream border border-border text-navy px-2 py-0.5 rounded-full capitalize">
            {product.style.replace("_", " ")}
          </span>
          <span className="text-xs bg-amber/10 border border-amber/20 text-amber-dark px-2 py-0.5 rounded-full">
            {finishLabels[product.finish] ?? product.finish}
          </span>
          {product.species && (
            <span className="text-xs bg-green-50 border border-green-200 text-green-800 px-2 py-0.5 rounded-full capitalize">
              {product.species}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed flex-1 mb-3">{product.description}</p>

        {/* Footer */}
        <div className="flex items-end justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{product.leadTimeDays}d lead time</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-navy leading-none">
              {formatCurrency(product.basePrice)}
            </p>
            <p className="text-xs text-muted mt-0.5">per {product.unit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
