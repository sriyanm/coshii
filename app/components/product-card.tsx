import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  showInventory?: boolean;
}

export function ProductCard({ product, showInventory }: ProductCardProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <Image
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-muted-foreground">${product.price}</p>
          {showInventory && product.inventory && product.inventory <= 3 && (
            <p className="text-sm text-red-500">{product.inventory} left</p>
          )}
        </div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </div>
  );
}
