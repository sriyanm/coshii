import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  showStock?: boolean;
}

export function ProductCard({ product, showStock }: ProductCardProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-muted-foreground">${product.price}</p>
          {showStock && product.stock && product.stock <= 3 && (
            <p className="text-sm text-red-500">{product.stock} left</p>
          )}
        </div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </div>
  );
}
