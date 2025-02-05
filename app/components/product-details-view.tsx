"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import type { Product } from "../types";
import InventoryInput from "./inventory-input";
import Link from "next/link";

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
}

export function ProductDetailsView({
  product,
  onBack,
}: ProductDetailsViewProps) {
  const [isListed, setIsListed] = useState(true);
  const [stock, setStock] = useState(product.stock || 0);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="relative">
        <button onClick={onBack} className="absolute left-4 top-4 z-10">
          <ChevronLeft className="size-6" />
        </button>
        <div className="mt-5 flex items-center justify-end gap-2">
          <span className="text-sm">Unlisted</span>
          <Switch checked={isListed} onCheckedChange={setIsListed} />
        </div>
        <Image
          src={product.image || "/ajay-product.png"}
          alt={product.name}
          width={400}
          height={400}
          className="mx-auto mt-2"
        />
      </div>

      <div className="space-y-6 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{product.name}</h1>
            <p className="text-xl">${product.price.toFixed(2)}</p>
          </div>
          <Link
            href={{
              pathname: "/add-product",
              query: { page: 1, step: "Update" },
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => console.log("Edit product")}
            >
              <Pencil className="size-5" />
            </Button>
          </Link>
        </div>

        <p className="text-muted-foreground">{product.description}</p>

        <p
          className="cursor-pointer text-center text-sm font-bold text-gray-600 hover:text-black"
          onClick={() => console.log("Delete listing")}
        >
          Delete Listing
        </p>

        <div className="flex items-center justify-center text-sm">
          <InventoryInput
            min={0}
            prefix={"Stock: "}
            inventory={stock}
            suffix={" left"}
            onInventoryChange={setStock}
          />
        </div>
      </div>
    </div>
  );
}
