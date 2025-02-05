import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Order } from "../types";
import { formatDate } from "../lib/utils";

export function OrderCard({ order }: { order: Order }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <Image
          src={order.items[0].product.image || "/placeholder.svg"}
          alt={order.items[0].product.name}
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div>
          <h3 className="font-medium">{order.customerName}</h3>
          <p className="text-sm text-muted-foreground">
            {order.items.length} items • {formatDate(order.date)}
          </p>
        </div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </div>
  );
}
