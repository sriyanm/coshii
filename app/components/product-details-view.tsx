"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import type { Product } from "../types";
import InventoryInput from "./inventory-input";
import Link from "next/link";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/app/lib/client/firebase";
import { useProductMediaDelete } from "@/app/hooks/firebase";

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onProductUpdate: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function ProductDetailsView({
  product,
  onBack,
  onProductUpdate,
  onDeleteProduct,
}: ProductDetailsViewProps) {
  const [isListed, setIsListed] = useState(product.isListed || false);
  const [inventory, setInventory] = useState(product.inventory || 0);
  const { mutateAsync: deleteMedia } = useProductMediaDelete();

  const updateProduct = async (updates: Partial<Product>) => {
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleIsListedChange = async (newValue: boolean) => {
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        isListed: newValue,
        updatedAt: new Date(),
      });
      setIsListed(newValue);
      const updatedProduct = { ...product, isListed: newValue };

      // Clear product cache safely
      if (auth.currentUser?.uid) {
        const CACHE_KEY = `cachedProducts-${auth.currentUser.uid}`;
        sessionStorage.removeItem(CACHE_KEY);
        console.log(`Cleared cache key: ${CACHE_KEY}`);
      } else {
        console.warn(
          "Could not clear product cache: no authenticated user UID found.",
        );
      }

      onProductUpdate(updatedProduct);
    } catch (error) {
      console.error("Error updating product listed status:", error);
    }
  };

  const handleInventoryChange = async (newValue: number) => {
    setInventory(newValue);
    const updatedProduct = { ...product, inventory: newValue };
    await updateProduct({ inventory: newValue });
    onProductUpdate(updatedProduct);
  };

const handleRemoveProductMedia = async (mediaUrls: string[]) => {
  console.log("Removing product media:", mediaUrls);

  const deletions = mediaUrls
    .filter((url) => url.startsWith("https://"))
    .map(async (url) => {
      try {
        await deleteMedia(url);
        console.log("Deleted from Firebase:", url);
      } catch (err) {
        console.error("Failed to delete media:", err);
      }
    });

    await Promise.allSettled(deletions);
  };

  const handleDeleteProduct = async () => {
    console.log("Product deleted:", product.id);
    console.log("Images", product.images);
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;
    try {
      const productRef = doc(db, "products", product.id);
      await handleRemoveProductMedia(product.images);
      await deleteDoc(productRef);
      onDeleteProduct?.(product.id);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="relative">
        <button onClick={onBack} className="absolute left-4 top-4 z-10">
          <ChevronLeft className="size-6" />
        </button>
        <div className="mt-5 flex items-center justify-end gap-2">
          <span className="text-sm">{isListed ? "Listed" : "Unlisted"}</span>
          <Switch checked={isListed} onCheckedChange={handleIsListedChange} />
        </div>
        <Image
          src={product.images[0] || "/ajay-product.png"}
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
              query: {
                // page: 1,
                step: "Update",
                productId: product.id,
              },
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
          onClick={handleDeleteProduct}
        >
          Delete Listing
        </p>

        <div className="flex items-center justify-center text-sm">
          <InventoryInput
            min={0}
            prefix={"Stock: "}
            inventory={inventory}
            suffix={" left"}
            onInventoryChange={handleInventoryChange}
          />
        </div>
      </div>
    </div>
  );
}
