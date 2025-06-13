import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  showInventory?: boolean;
}

function isVideo(file: string) {
  return file.split("?")[0].toLowerCase().endsWith(".mp4") || file.split("?")[0].toLowerCase().endsWith(".mov");
}

export function ProductCard({ product, showInventory }: ProductCardProps) {
  const media = product.images?.[0] || "/placeholder.svg";
  const isVideoFile = isVideo(media);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        {isVideoFile ? (
          <video
            src={media}
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover shrink-0"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image
            src={media}
            alt={product.name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover shrink-0"
          />
        )}
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
